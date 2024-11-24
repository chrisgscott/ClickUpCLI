import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { deleteTask, getTask } from '../services/clickup.js';

export const delete_command = new Command('delete')
  .description('Delete a task and optionally its subtasks')
  .argument('<taskId>', 'ID of the task to delete')
  .option('-f, --force', 'Skip confirmation prompt')
  .action(async (taskId, options) => {
    try {
      // Get task details first
      const task = await getTask(taskId);

      if (!options.force) {
        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: chalk.yellow(`Are you sure you want to delete task "${task.name}" (${taskId})?`),
            default: false
          }
        ]);

        if (!answers.confirm) {
          console.log(chalk.blue('Task deletion cancelled.'));
          return;
        }
      }

      await deleteTask(taskId);
      console.log(chalk.green(`\n✓ Task "${task.name}" deleted successfully!`));
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(chalk.red('Error deleting task:'), error.message);
      } else {
        console.error(chalk.red('Error deleting task: An unknown error occurred'));
      }
      process.exit(1);
    }
  });

export default delete_command;
