import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { getConfig, updateConfig } from '../config/store.js';
import { getWorkspaces, getSpaces, getLists } from '../services/clickup.js';
import { promises as fs } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const CONFIG_DIR = join(homedir(), '.task-cli');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export const config = new Command('config')
  .description('Configure the CLI')
  .option('-i, --interactive', 'Interactive configuration mode')
  .action(async (options) => {
    try {
      // Check if config exists
      try {
        await fs.access(CONFIG_FILE);
      } catch {
        options.interactive = true;
      }

      if (options.interactive) {
        let config;
        try {
          config = await getConfig();
        } catch {
          config = { clickup: { token: '' } };
        }

        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'token',
            message: 'Enter your ClickUp API token:',
            default: config.clickup.token,
            validate: (input: string) => {
              if (!input.trim()) {
                return 'API token is required';
              }
              return true;
            }
          }
        ]);

        // Update token first to ensure it's valid before fetching workspaces
        await updateConfig({
          clickup: {
            ...config.clickup,
            token: answers.token
          }
        });

        // Fetch workspaces
        const workspaces = await getWorkspaces();
        if (!workspaces.length) {
          console.error(chalk.red('No workspaces found. Please check your API token.'));
          process.exit(1);
        }

        const workspaceAnswer = await inquirer.prompt([
          {
            type: 'list',
            name: 'workspace',
            message: 'Select a workspace:',
            choices: workspaces.map(w => ({ name: w.name, value: w.id })),
            default: config.clickup.defaultWorkspace
          }
        ]);

        // Fetch spaces
        const spaces = await getSpaces(workspaceAnswer.workspace);
        const spaceAnswer = await inquirer.prompt([
          {
            type: 'list',
            name: 'space',
            message: 'Select a space:',
            choices: spaces.map(s => ({ name: s.name, value: s.id })),
            default: config.clickup.defaultSpace
          }
        ]);

        // Fetch lists
        const lists = await getLists(spaceAnswer.space);
        const listAnswer = await inquirer.prompt([
          {
            type: 'list',
            name: 'list',
            message: 'Select a default list:',
            choices: lists.map(l => ({ name: l.name, value: l.id })),
            default: config.clickup.defaultList
          }
        ]);

        // Save all settings
        await updateConfig({
          clickup: {
            token: answers.token,
            defaultWorkspace: workspaceAnswer.workspace,
            defaultSpace: spaceAnswer.space,
            defaultList: listAnswer.list
          }
        });

        console.log(chalk.green('\n✓ Configuration saved successfully!'));
      } else {
        const config = await getConfig();
        console.log(chalk.blue('\nCurrent configuration:'));
        console.log('API Token:', config.clickup.token ? '********' : 'Not set');
        console.log('Default Workspace:', config.clickup.defaultWorkspace || 'Not set');
        console.log('Default Space:', config.clickup.defaultSpace || 'Not set');
        console.log('Default List:', config.clickup.defaultList || 'Not set');
        console.log('\nUse --interactive or -i to update configuration');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(chalk.red('Error configuring CLI:'), error.message);
      } else {
        console.error(chalk.red('Error configuring CLI: An unknown error occurred'));
      }
      process.exit(1);
    }
  });

export default config;
