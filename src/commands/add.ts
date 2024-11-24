import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { createTask, createSubtask, getListStatuses, getSpaceTags, updateTaskTags } from '../services/clickup.js';
import { getConfig } from '../config/store.js';
import { TaskStatus, Tag } from '../types/clickup.js';
import { sanitizeText } from '../utils/text.js';

export const add = new Command('add')
  .description('Add a new task or subtask')
  .argument('[name]', 'Name of the task')
  .option('-d, --description <description>', 'Task description')
  .option('-s, --status <status>', 'Task status (e.g., "in progress", "backlog")')
  .option('-p, --priority <priority>', 'Task priority (e.g., "urgent", "high", "normal")')
  .option('-t, --parent <taskId>', 'Parent task ID (creates a subtask)')
  .option('--tags <tags>', 'Comma-separated list of tags to add to the task')
  .action(async (taskName, options) => {
    try {
      const config = await getConfig();
      let { description, priority, status } = options;
      const { taskId } = options;
      let name = taskName;

      // Ensure we have a list ID when creating a task
      if (!config.clickup?.defaultList && !taskId) {
        console.error(chalk.red('Default list not set. Please run "task config --interactive" first.'));
        process.exit(1);
      }

      const listId = config.clickup?.defaultList;

      // Get available statuses for the list if we're creating a task (not a subtask)
      let availableStatuses: TaskStatus[] = [];
      if (!taskId && listId) {
        try {
          availableStatuses = await getListStatuses(listId);
        } catch (error) {
          console.error(chalk.red('Error fetching list statuses. Will proceed without status validation.'));
        }
      }

      // Get current tags if we're in interactive mode
      let availableTags: Tag[] = [];
      if (!taskId && listId) {
        try {
          availableTags = await getSpaceTags(config.clickup.defaultSpace || '');
        } catch (error) {
          console.error(chalk.yellow('Warning: Could not fetch tags. Will proceed without tag selection.'));
        }
      }

      if (!name || !description || !priority || (!status && availableStatuses.length > 0)) {
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
          },
          {
            type: 'list',
            name: 'status',
            message: 'Task status:',
            choices: availableStatuses.map(s => ({
              name: s.status,
              value: s.status
            })),
            when: !status && availableStatuses.length > 0
          },
          {
            type: 'checkbox',
            name: 'tags',
            message: 'Select tags (optional):',
            choices: availableTags.map(t => ({
              name: chalk.hex(t.tag_bg).bgHex(t.tag_fg)(` ${t.name} `),
              value: t.name
            })),
            when: availableTags.length > 0 && !options.tags
          }
        ]);

        name = name || answers.name;
        description = description || answers.description;
        priority = priority || answers.priority;
        status = status || answers.status;
        options.tags = options.tags || (answers.tags ? answers.tags.join(',') : undefined);
      }

      if (!name || !description) {
        console.error(chalk.red('Task name and description are required.'));
        process.exit(1);
      }

      // Validate status if provided and we have available statuses
      if (status && availableStatuses.length > 0 && !availableStatuses.some(s => s.status === status)) {
        console.error(chalk.red(`Invalid status: ${status}`));
        console.log('Available statuses:', availableStatuses.map(s => s.status).join(', '));
        process.exit(1);
      }

      // Create the task
      if (taskId) {
        const task = await createSubtask(
          taskId,
          name,
          description ? sanitizeText(description) : undefined,
          Number(priority),
          status
        );

        // Add tags if specified
        if (options.tags) {
          await updateTaskTags(task.id, options.tags.split(','));
        }

        console.log(chalk.green('\n✓ Subtask created successfully!'));
        console.log('\nCreated subtask details:');
        console.log(`ID: ${chalk.blue(task.id)}`);
        console.log(`Name: ${task.name}`);
        console.log(`Description: ${task.description}`);
        console.log(`Status: ${task.status.status}`);
        console.log(`Priority: ${task.priority?.priority || 'none'}`);
        if (task.tags?.length > 0) {
          console.log('Tags:', task.tags.map(t => chalk.hex(t.tag_bg).bgHex(t.tag_fg)(` ${t.name} `)).join(' '));
        }
      } else if (listId) {
        const task = await createTask(
          listId,
          name,
          description ? sanitizeText(description) : undefined,
          Number(priority),
          status
        );

        // Add tags if specified
        if (options.tags) {
          await updateTaskTags(task.id, options.tags.split(','));
        }

        console.log(chalk.green('\n✓ Task created successfully!'));
        console.log('\nCreated task details:');
        console.log(`ID: ${chalk.blue(task.id)}`);
        console.log(`Name: ${task.name}`);
        console.log(`Description: ${task.description}`);
        console.log(`Status: ${task.status.status}`);
        console.log(`Priority: ${task.priority?.priority || 'none'}`);
        if (task.tags?.length > 0) {
          console.log('Tags:', task.tags.map(t => chalk.hex(t.tag_bg).bgHex(t.tag_fg)(` ${t.name} `)).join(' '));
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(chalk.red('Error creating task:'), error.message);
      } else {
        console.error(chalk.red('Error creating task: An unknown error occurred'));
      }
      process.exit(1);
    }
  });

export default add;
