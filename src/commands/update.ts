import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { getTask, updateTask } from '../services/clickup.js';

export default function updateCommand(program: Command) {
  program
    .command('update')
    .description('Update a task')
    .argument('<id>', 'Task ID')
    .option('-n, --name <name>', 'New task name')
    .option('-d, --description <description>', 'New task description')
    .option('-p, --priority <priority>', 'New task priority (1-4)')
    .option('-s, --status <status>', 'New task status')
    .action(async (id, options) => {
      try {
        const task = await getTask(id);
        
        if (!options.name && !options.description && !options.priority && !options.status) {
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'name',
              message: 'New task name (leave empty to keep current):',
              default: task.name
            },
            {
              type: 'input',
              name: 'description',
              message: 'New task description (leave empty to keep current):',
              default: task.description
            },
            {
              type: 'list',
              name: 'priority',
              message: 'New task priority:',
              choices: [
                { name: 'Urgent', value: '1' },
                { name: 'High', value: '2' },
                { name: 'Normal', value: '3' },
                { name: 'Low', value: '4' }
              ],
              default: task.priority.priority.toString()
            },
            {
              type: 'input',
              name: 'status',
              message: 'New task status (leave empty to keep current):',
              default: task.status.status
            }
          ]);

          options.name = answers.name !== task.name ? answers.name : undefined;
          options.description = answers.description !== task.description ? answers.description : undefined;
          options.priority = answers.priority !== task.priority.priority.toString() ? answers.priority : undefined;
          options.status = answers.status !== task.status.status ? answers.status : undefined;
        }

        const updatedTask = await updateTask(id, {
          name: options.name,
          description: options.description,
          priority: options.priority ? parseInt(options.priority) : undefined,
          status: options.status
        });

        console.log(chalk.green('\n✓ Task updated successfully!'));
        console.log(chalk.blue('\nUpdated task details:'));
        console.log(chalk.white(`Name: ${updatedTask.name}`));
        console.log(chalk.white(`Description: ${updatedTask.description || 'N/A'}`));
        console.log(chalk.white(`Priority: ${updatedTask.priority.priority}`));
        console.log(chalk.white(`Status: ${updatedTask.status.status}`));

      } catch (error) {
        console.error(chalk.red('Error updating task:'), error);
        process.exit(1);
      }
    });
}
