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

export default function configCommand(program: Command) {
  program
    .command('config')
    .description('Configure the CLI')
    .option('-i, --interactive', 'Interactive configuration mode')
    .action(async (options) => {
      try {
        // Check if config exists
        try {
          await fs.access(CONFIG_FILE);
        } catch {
          console.log(chalk.yellow('Configuration not found. Running setup...'));
          const { spawn } = await import('child_process');
          const setupProcess = spawn('node', ['./dist/scripts/setup.js'], {
            stdio: 'inherit',
            cwd: process.cwd()
          });
          
          await new Promise((resolve, reject) => {
            setupProcess.on('close', (code) => {
              if (code === 0) {
                resolve(null);
              } else {
                reject(new Error(`Setup process exited with code ${code}`));
              }
            });
          });
          return;
        }

        const config = await getConfig();

        if (options.interactive) {
          const workspaces = await getWorkspaces();
          
          const { workspace } = await inquirer.prompt([
            {
              type: 'list',
              name: 'workspace',
              message: 'Select default workspace:',
              choices: workspaces.map(w => ({
                name: w.name,
                value: w.id
              }))
            }
          ]);

          const spaces = await getSpaces(workspace);
          const { space } = await inquirer.prompt([
            {
              type: 'list',
              name: 'space',
              message: 'Select default space:',
              choices: spaces.map(s => ({
                name: s.name,
                value: s.id
              }))
            }
          ]);

          const lists = await getLists(space);
          const { list } = await inquirer.prompt([
            {
              type: 'list',
              name: 'list',
              message: 'Select default list:',
              choices: lists.map(l => ({
                name: l.name,
                value: l.id
              }))
            }
          ]);

          await updateConfig({
            ...config,
            clickup: {
              ...config.clickup,
              defaultWorkspace: workspace,
              defaultSpace: space,
              defaultList: list
            }
          });

          console.log(chalk.green('\n✓ Configuration updated successfully!'));
        } else {
          console.log(chalk.blue('\nCurrent configuration:'));
          console.log(JSON.stringify(config, null, 2));
          console.log(chalk.blue('\nTo update configuration interactively, use:'));
          console.log(chalk.white('  task config --interactive\n'));
        }
      } catch (error) {
        console.error(chalk.red('Error updating configuration:'), error);
        process.exit(1);
      }
    });
}
