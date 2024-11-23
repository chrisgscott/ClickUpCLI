import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { createTask } from '../services/clickup.js';
import { getConfig } from '../config/store.js';

export default function addCommand(program: Command) {
  program
    .command('add')
    .description('Add a new task')
    .option('-n, --name <name>', 'Task name')
    .option('-d, --description <description>', 'Task description')
    .option('-p, --priority <priority>', 'Task priority (1-4)')
    .action(async (options) => {
      try {
        const config = await getConfig();
        
        if (!config.clickup.defaultList) {
          console.error(chalk.red('Default list not set. Please run "task config --interactive" first.'));
          process.exit(1);
        }

        let name = options.name;
        let description = options.description;
        let priority = options.priority;

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

        const task = await createTask(name, description, parseInt(priority));
        console.log(chalk.green('\n✓ Task created successfully!'));
        console.log(chalk.blue('\nTask details:'));
        console.log(chalk.white(`Name: ${task.name}`));
        console.log(chalk.white(`Description: ${task.description}`));
        console.log(chalk.white(`Priority: ${task.priority.priority}`));
        console.log(chalk.white(`Status: ${task.status.status}`));

      } catch (error) {
        console.error(chalk.red('Error creating task:'), error);
        process.exit(1);
      }
    });
}
