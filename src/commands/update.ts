import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { getTask, updateTask } from '../services/clickup.js';
import { UpdateTaskParams } from '../types/clickup.js';

export const update = new Command('update')
  .description('Update an existing task\'s name, description, status, or priority')
  .argument('<taskId>', 'ID of the task to update')
  .option('-n, --name <name>', 'New task name')
  .option('-d, --description <description>', 'New task description')
  .option('-s, --status <status>', 'New task status (e.g., "in progress", "complete")')
  .option('-p, --priority <priority>', 'New task priority (e.g., "urgent", "high", "normal")')
  .action(async (taskId: string, options) => {
    try {
      // Get current task details
      const task = await getTask(taskId);
      
      // Prepare updates
      const updates: UpdateTaskParams = {};
      if (options.name) updates.name = options.name;
      if (options.description) updates.description = options.description;
      if (options.priority) updates.priority = Number(options.priority);
      if (options.status) updates.status = options.status;

      // Update task
      const updatedTask = await updateTask(taskId, updates);

      console.log(chalk.green('\n✓ Task updated successfully!'));
      console.log(chalk.blue('\nUpdated task details:'));
      console.log(chalk.white(`Name: ${updatedTask.name}`));
      console.log(chalk.white(`Description: ${updatedTask.description || 'N/A'}`));
      console.log(chalk.white(`Status: ${updatedTask.status.status || 'N/A'}`));
      console.log(chalk.white(`Priority: ${updatedTask.priority?.priority || 'N/A'}`));

    } catch (error) {
      console.error(chalk.red('Error updating task:'), error);
      process.exit(1);
    }
  });

export default update;
