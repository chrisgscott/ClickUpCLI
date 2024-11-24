import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { getTask, updateTask, getSpaceTags } from '../services/clickup.js';
import { UpdateTaskParams } from '../types/clickup.js';

export const update = new Command('update')
  .description('Update a task')
  .argument('<taskId>', 'ID of the task to update')
  .option('-n, --name <name>', 'New task name')
  .option('-d, --description <description>', 'New task description')
  .option('-s, --status <status>', 'New task status')
  .option('-p, --priority <priority>', 'New task priority')
  .option('--tags <tags>', 'Comma-separated list of tags (replaces existing tags)')
  .option('-i, --interactive', 'Update task interactively')
  .action(async (taskId: string, options) => {
    try {
      let updates: UpdateTaskParams = {};

      if (options.interactive) {
        // Get current task details
        const task = await getTask(taskId);
        const availableTags = await getSpaceTags(task.space.id);

        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Task name:',
            default: task.name
          },
          {
            type: 'input',
            name: 'description',
            message: 'Task description:',
            default: task.description
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
            default: task.priority?.id
          },
          {
            type: 'checkbox',
            name: 'tags',
            message: 'Select tags:',
            choices: availableTags.map(t => ({
              name: chalk.hex(t.tag_bg).bgHex(t.tag_fg)(` ${t.name} `),
              value: t.name,
              checked: task.tags?.some(taskTag => taskTag.name === t.name)
            }))
          }
        ]);

        updates = {
          name: answers.name !== task.name ? answers.name : undefined,
          description: answers.description !== task.description ? answers.description : undefined,
          priority: answers.priority !== task.priority?.id ? Number(answers.priority) : undefined,
          tags: answers.tags
        };
      } else {
        updates = {
          name: options.name,
          description: options.description,
          priority: options.priority ? Number(options.priority) : undefined,
          status: options.status,
          tags: options.tags?.split(',')
        };
      }

      // Update task
      const updatedTask = await updateTask(taskId, updates);

      console.log(chalk.green('\n✓ Task updated successfully!'));
      console.log('\nUpdated task details:');
      if (updates.name) console.log(`Name: ${updatedTask.name}`);
      if (updates.description) console.log(`Description: ${updatedTask.description || 'N/A'}`);
      if (updates.status) console.log(`Status: ${updatedTask.status?.status || 'N/A'}`);
      if (updates.priority) console.log(`Priority: ${updatedTask.priority?.priority || 'N/A'}`);
      if (updates.tags) console.log(`Tags: ${updatedTask.tags?.map(tag => tag.name).join(', ') || 'N/A'}`);

    } catch (error) {
      console.error(chalk.red('Error updating task:'), error);
      process.exit(1);
    }
  });

export default update;
