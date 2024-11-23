import { Command } from 'commander';
import chalk from 'chalk';
import { getTask, updateTask } from '../services/clickup.js';
import { Task, TaskStatus } from '../types/clickup.js';

export const updateCommand = new Command('update')
  .description('Update a task')
  .argument('<id>', 'Task ID')
  .option('-n, --name <name>', 'New task name')
  .option('-d, --description <description>', 'New task description')
  .option('-p, --priority <priority>', 'New task priority (1-4)')
  .option('-s, --status <status>', 'New task status')
  .action(async (id: string, options) => {
    try {
      // Get current task to preserve existing values
      const currentTask = await getTask(id);
      
      const updates: Partial<Task> = {};
      
      if (options.name) {
        updates.name = options.name;
      }
      
      if (options.description) {
        updates.description = options.description;
      }
      
      if (options.priority) {
        const priority = parseInt(options.priority);
        if (isNaN(priority) || priority < 1 || priority > 4) {
          throw new Error('Priority must be a number between 1 and 4');
        }
        updates.priority = {
          priority,
          color: currentTask.priority.color
        };
      }
      
      if (options.status) {
        const newStatus: TaskStatus = {
          status: options.status,
          color: currentTask.status.color,
          type: currentTask.status.type,
          orderindex: currentTask.status.orderindex
        };
        updates.status = newStatus;
      }

      const updatedTask = await updateTask(id, updates);
      
      console.log(chalk.green('✓ Task updated successfully:'));
      console.log(`ID: ${updatedTask.id}`);
      console.log(`Name: ${updatedTask.name}`);
      console.log(`Status: ${updatedTask.status.status}`);
      if (updatedTask.description) {
        console.log(`Description: ${updatedTask.description}`);
      }
      console.log(`Priority: ${getPriorityLabel(updatedTask.priority.priority)}`);
      if (updatedTask.parent) {
        console.log(`Parent Task: ${updatedTask.parent}`);
      }
      console.log();

    } catch (error) {
      console.error(chalk.red('Error updating task:'), error);
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
