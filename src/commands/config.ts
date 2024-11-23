import { Command } from 'commander';
import chalk from 'chalk';
import { getConfig, updateConfig } from '../config/store.js';
import { Config } from '../types/clickup.js';
import { getWorkspaces, getSpaces, getLists } from '../services/clickup.js';

export const configCommand = new Command('config')
  .description('Configure the CLI')
  .option('--token <token>', 'Set ClickUp API token')
  .option('--workspace <id>', 'Set default workspace ID')
  .option('--space <id>', 'Set default space ID')
  .option('--list <id>', 'Set default list ID')
  .option('--interactive', 'Configure interactively')
  .action(async (options) => {
    try {
      const currentConfig = await getConfig();
      const updates: Config = {
        clickup: {
          token: options.token || currentConfig.clickup.token,
          defaultWorkspace: options.workspace || currentConfig.clickup.defaultWorkspace,
          defaultSpace: options.space || currentConfig.clickup.defaultSpace,
          defaultList: options.list || currentConfig.clickup.defaultList
        }
      };

      if (options.interactive) {
        try {
          // Get workspaces
          const workspaces = await getWorkspaces();
          console.log('\nAvailable workspaces:');
          workspaces.forEach((w, i) => {
            console.log(`${i + 1}. ${w.name} (${w.id})`);
          });
          const workspaceIndex = parseInt(await prompt('Select workspace (number): ')) - 1;
          if (workspaceIndex >= 0 && workspaceIndex < workspaces.length) {
            const selectedWorkspace = workspaces[workspaceIndex];
            updates.clickup.defaultWorkspace = selectedWorkspace.id;

            // Get spaces
            const spaces = await getSpaces(selectedWorkspace.id);
            console.log('\nAvailable spaces:');
            spaces.forEach((s, i) => {
              console.log(`${i + 1}. ${s.name} (${s.id})`);
            });
            const spaceIndex = parseInt(await prompt('Select space (number): ')) - 1;
            if (spaceIndex >= 0 && spaceIndex < spaces.length) {
              const selectedSpace = spaces[spaceIndex];
              updates.clickup.defaultSpace = selectedSpace.id;

              // Get lists
              const lists = await getLists(selectedSpace.id);
              console.log('\nAvailable lists:');
              lists.forEach((l, i) => {
                console.log(`${i + 1}. ${l.name} (${l.id})`);
              });
              const listIndex = parseInt(await prompt('Select list (number): ')) - 1;
              if (listIndex >= 0 && listIndex < lists.length) {
                updates.clickup.defaultList = lists[listIndex].id;
              }
            }
          }
        } catch (error) {
          console.error(chalk.red('Error during interactive configuration:'), error);
          process.exit(1);
        }
      }

      await updateConfig(updates);
      
      // Display current configuration
      const config = await getConfig();
      console.log(chalk.green('\nCurrent configuration:'));
      console.log('Token:', config.clickup.token ? '********' : 'Not set');
      console.log('Default Workspace:', config.clickup.defaultWorkspace || 'Not set');
      console.log('Default Space:', config.clickup.defaultSpace || 'Not set');
      console.log('Default List:', config.clickup.defaultList || 'Not set');

    } catch (error) {
      console.error(chalk.red('Error updating configuration:'), error);
      process.exit(1);
    }
  });

function prompt(question: string): Promise<string> {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    readline.question(question, (answer: string) => {
      readline.close();
      resolve(answer);
    });
  });
}
