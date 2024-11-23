import { Command } from 'commander';
import chalk from 'chalk';
import { createTask, createSubtask } from '../services/clickup.js';

export const addCommand = new Command('add')
  .description('Add a new task')
  .argument('<name>', 'Task name')
  .option('-d, --description <description>', 'Task description')
  .option('-p, --priority <priority>', 'Task priority (1-4)', '3')
  .option('-s, --status <status>', 'Task status')
  .option('-t, --parent <taskId>', 'Parent task ID (creates a subtask)')
  .action(async (name, options) => {
    try {
      const priority = parseInt(options.priority);
      if (isNaN(priority) || priority < 1 || priority > 4) {
        throw new Error('Priority must be a number between 1 and 4');
      }

      const task = options.parent
        ? await createSubtask(
            options.parent,
            name,
            options.description,
            priority,
            options.status
          )
        : await createTask(
            name,
            options.description,
            priority,
            options.status
          );

      console.log(chalk.green('✓ Task created successfully:'));
      console.log(`ID: ${task.id}`);
      console.log(`Name: ${task.name}`);
      console.log(`Status: ${task.status.status}`);
      if (task.description) {
        console.log(`Description: ${task.description}`);
      }
      console.log(`Priority: ${getPriorityLabel(task.priority.priority)}`);
      if (task.parent) {
        console.log(`Parent Task: ${task.parent}`);
      }
      console.log();

    } catch (error) {
      console.error(chalk.red('Error creating task:'), error);
      process.exit(1);
    }
  });

function getPriorityLabel(priority: number): string {
  switch (priority) {
    case 1:
      return 'urgent';
    case 2:
      return 'high';
    case 3:
      return 'normal';
    case 4:
      return 'low';
    default:
      return 'normal';
  }
}
