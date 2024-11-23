import { Command } from 'commander';
import chalk from 'chalk';
import { listTasks } from '../services/clickup.js';
import { getConfig } from '../config/store.js';

export default function listCommand(program: Command) {
  program
    .command('list')
    .description('List all tasks')
    .option('-l, --list <id>', 'List ID (overrides default)')
    .action(async (options) => {
      try {
        const config = await getConfig();
        const listId = options.list || config.clickup.defaultList;

        if (!listId) {
          console.error(chalk.red('No list ID provided. Please run "task config --interactive" first.'));
          process.exit(1);
        }

        const tasks = await listTasks(listId);

        if (tasks.length === 0) {
          console.log(chalk.yellow('\nNo tasks found.'));
          return;
        }

        console.log(chalk.blue('\nTasks:'));
        tasks.forEach(task => {
          console.log(chalk.white('\n-----------------------------------'));
          console.log(chalk.white(`Name: ${task.name}`));
          if (task.description) {
            console.log(chalk.white(`Description: ${task.description}`));
          }
          console.log(chalk.white(`Status: ${task.status.status}`));
          console.log(chalk.white(`Priority: ${task.priority.priority}`));
          if (task.parent) {
            console.log(chalk.white(`Parent Task: ${task.parent}`));
          }
        });
        console.log(chalk.white('\n-----------------------------------\n'));

      } catch (error) {
        console.error(chalk.red('Error listing tasks:'), error);
        process.exit(1);
      }
    });
}
