import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { getConfig } from '../config/store.js';
import { getListStatuses, createStatus, updateStatus, deleteStatus } from '../services/clickup.js';
import { TaskStatus } from '../types/clickup.js';

// Helper function to validate color format (#RRGGBB)
function isValidColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

export const status = new Command('status')
  .description('Manage statuses in your ClickUp list')
  .option('-l, --list <listId>', 'List ID (defaults to configured list)')
  .option('-i, --interactive', 'Use interactive mode')
  .option('-a, --add <name>', 'Add a new status')
  .option('-u, --update <oldName>', 'Update an existing status')
  .option('-d, --delete <name>', 'Delete a status')
  .option('-c, --color <color>', 'Color for the status (in #RRGGBB format)')
  .action(async (options) => {
    try {
      const config = await getConfig();
      const listId = options.list || config.clickup.defaultList;

      if (!listId) {
        console.error(chalk.red('Default list not set. Please run "task config --interactive" first.'));
        process.exit(1);
      }

      // Get current statuses
      const currentStatuses = await getListStatuses(listId);

      if (options.interactive) {
        await interactiveMode(listId, currentStatuses);
        return;
      }

      // Handle non-interactive commands
      if (options.add) {
        if (!options.color) {
          console.error(chalk.red('Color is required when adding a status. Use --color <#RRGGBB>'));
          process.exit(1);
        }

        if (!isValidColor(options.color)) {
          console.error(chalk.red('Invalid color format. Use #RRGGBB format (e.g., #FF0000)'));
          process.exit(1);
        }

        await createStatus(listId, options.add, options.color);
        console.log(chalk.green(`\n✓ Status "${options.add}" created successfully!`));
      }
      else if (options.update) {
        const existingStatus = currentStatuses.find(s => s.status === options.update);
        if (!existingStatus) {
          console.error(chalk.red(`Status "${options.update}" not found`));
          process.exit(1);
        }

        await updateStatus(
          listId,
          options.update,
          options.name || options.update,
          options.color
        );
        console.log(chalk.green(`\n✓ Status "${options.update}" updated successfully!`));
      }
      else if (options.delete) {
        const existingStatus = currentStatuses.find(s => s.status === options.delete);
        if (!existingStatus) {
          console.error(chalk.red(`Status "${options.delete}" not found`));
          process.exit(1);
        }

        await deleteStatus(listId, options.delete);
        console.log(chalk.green(`\n✓ Status "${options.delete}" deleted successfully!`));
      }
      else {
        // List all statuses
        console.log(chalk.blue('\nCurrent statuses:'));
        currentStatuses.forEach(status => {
          console.log(`${chalk.hex(status.color || '#ffffff')('■')} ${status.status}`);
        });
        console.log('\nUse --interactive or -i for status management interface');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('Error managing statuses:'), error.message);
      } else {
        console.error(chalk.red('An unknown error occurred'));
      }
      process.exit(1);
    }
  });

async function interactiveMode(listId: string, currentStatuses: TaskStatus[]): Promise<void> {
  let shouldContinue = true;
  while (shouldContinue) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'List all statuses', value: 'list' },
          { name: 'Add new status', value: 'add' },
          { name: 'Update existing status', value: 'update' },
          { name: 'Delete status', value: 'delete' },
          { name: 'Exit', value: 'exit' }
        ]
      }
    ]);

    if (action === 'exit') {
      shouldContinue = false;
    }

    if (action === 'list') {
      console.log(chalk.blue('\nCurrent statuses:'));
      currentStatuses.forEach(status => {
        console.log(`${chalk.hex(status.color || '#ffffff')('■')} ${status.status}`);
      });
      console.log(''); // Empty line for readability
      continue;
    }

    if (action === 'add') {
      const { name, color } = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Enter the name for the new status:',
          validate: (input: string): boolean | string => {
            if (!input) return 'Status name is required';
            if (currentStatuses.some(s => s.status === input)) {
              return 'Status with this name already exists';
            }
            return true;
          }
        },
        {
          type: 'input',
          name: 'color',
          message: 'Enter the color for the status (in #RRGGBB format):',
          validate: (input: string): boolean | string => {
            if (!isValidColor(input)) {
              return 'Invalid color format. Use #RRGGBB format (e.g., #FF0000)';
            }
            return true;
          }
        }
      ]);

      await createStatus(listId, name, color);
      console.log(chalk.green(`\n✓ Status "${name}" created successfully!\n`));
      currentStatuses = await getListStatuses(listId);
    }

    if (action === 'update') {
      if (currentStatuses.length === 0) {
        console.log(chalk.yellow('\nNo statuses to update\n'));
        continue;
      }

      const { status: selectedStatus } = await inquirer.prompt([
        {
          type: 'list',
          name: 'status',
          message: 'Select a status to update:',
          choices: currentStatuses.map(s => ({
            name: `${chalk.hex(s.color || '#ffffff')('■')} ${s.status}`,
            value: s.status
          }))
        }
      ]);

      const { newName, newColor } = await inquirer.prompt([
        {
          type: 'input',
          name: 'newName',
          message: 'Enter the new name (leave empty to keep current):',
          default: selectedStatus
        },
        {
          type: 'input',
          name: 'newColor',
          message: 'Enter the new color (in #RRGGBB format, leave empty to keep current):',
          validate: (input: string): boolean | string => {
            if (!input) return true;
            if (!isValidColor(input)) {
              return 'Invalid color format. Use #RRGGBB format (e.g., #FF0000)';
            }
            return true;
          }
        }
      ]);

      await updateStatus(
        listId,
        selectedStatus,
        newName || selectedStatus,
        newColor || undefined
      );
      console.log(chalk.green(`\n✓ Status "${selectedStatus}" updated successfully!\n`));
      currentStatuses = await getListStatuses(listId);
    }

    if (action === 'delete') {
      if (currentStatuses.length === 0) {
        console.log(chalk.yellow('\nNo statuses to delete\n'));
        continue;
      }

      const { status: selectedStatus, confirm } = await inquirer.prompt([
        {
          type: 'list',
          name: 'status',
          message: 'Select a status to delete:',
          choices: currentStatuses.map(s => ({
            name: `${chalk.hex(s.color || '#ffffff')('■')} ${s.status}`,
            value: s.status
          }))
        },
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to delete this status? This cannot be undone.',
          default: false
        }
      ]);

      if (confirm) {
        await deleteStatus(listId, selectedStatus);
        console.log(chalk.green(`\n✓ Status "${selectedStatus}" deleted successfully!\n`));
        currentStatuses = await getListStatuses(listId);
      }
    }
  }
}

export default status;
