import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { createTask, createSubtask } from '../services/clickup.js';
import { getConfig } from '../config/store.js';

export const add = new Command('add')
  .description('Add a new task')
  .option('-n, --name <n>', 'Task name')
  .option('-d, --description <description>', 'Task description')
  .option('-p, --priority <priority>', 'Task priority (1-4)')
  .option('--parent-id <parentId>', 'Parent task ID (for creating subtasks)')
  .action(async (options) => {
    try {
      const config = await getConfig();
      let { name, description, priority, parentId } = options;

      if (!config.clickup.defaultList && !parentId) {
        console.error(chalk.red('Default list not set. Please run "task config --interactive" first.'));
        process.exit(1);
      }

      if (!name || !description || !priority) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Task name:',
            when: !name
          },
          {
            type: 'input',
            name: 'description',
            message: 'Task description:',
            when: !description
          },
          {
            type: 'list',
            name: 'priority',
            message: 'Task priority:',
            choices: [
              { name: 'Urgent', value: '1' },
              { name: 'High', value: '2' },
              { name: 'Normal', value: '3' },
              { name: 'Low', value: '4' }
            ],
            when: !priority
          }
        ]);

        name = name || answers.name;
        description = description || answers.description;
        priority = priority || answers.priority;
      }

      const numericPriority = Number(priority);
      if (isNaN(numericPriority) || numericPriority < 1 || numericPriority > 4) {
        console.error(chalk.red('Invalid priority. Must be a number between 1 and 4.'));
        process.exit(1);
      }

      let task;
      if (parentId) {
        // Create subtask
        task = await createSubtask(
          parentId,
          name,
          description,
          numericPriority
        );
        console.log(chalk.green('\n✓ Subtask created successfully!'));
      } else {
        // Create regular task
        task = await createTask(
          name,
          description,
          config.clickup.defaultList,
          numericPriority
        );
        console.log(chalk.green('\n✓ Task created successfully!'));
      }

      console.log(chalk.blue('\nTask details:'));
      console.log(chalk.white(`Name: ${task.name}`));
      console.log(chalk.white(`Description: ${task.description || 'N/A'}`));
      console.log(chalk.white(`Status: ${task.status.status || 'N/A'}`));
      console.log(chalk.white(`Priority: ${task.priority?.priority || 'N/A'}`));
      if (parentId) {
        console.log(chalk.white(`Parent Task: ${parentId}`));
      }

    } catch (error: any) {
      if (error.response?.data?.err) {
        console.error(chalk.red('Error creating task:'), error.response.data.err);
      } else {
        console.error(chalk.red('Error creating task:'), error.message);
      }
      process.exit(1);
    }
  });

export default add;
