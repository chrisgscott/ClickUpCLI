import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs/promises';
import { listTasks } from '../services/clickup.js';
import { getConfig } from '../config/store.js';

export const exportCmd = new Command('export')
  .description('Export tasks to a markdown file')
  .option('-o, --output <file>', 'Output file', 'tasks.md')
  .action(async (options) => {
    try {
      const config = await getConfig();
      const listId = config.clickup.defaultList;

      if (!listId) {
        console.error(chalk.red('Default list not set. Please run "task config --interactive" first.'));
        process.exit(1);
      }

      const tasks = await listTasks(listId);
      let markdown = '# Tasks\n\n';

      tasks.forEach(task => {
        const taskData = {
          name: task.name,
          description: task.description || '',
          status: task.status.status || '',
          priority: task.priority?.priority || 'Not set',
          url: task.url,
          id: task.id
        };

        markdown += `## ${taskData.name}\n\n`;
        if (taskData.description) {
          markdown += `${taskData.description}\n\n`;
        }
        markdown += `- Status: ${taskData.status}\n`;
        markdown += `- Priority: ${taskData.priority}\n`;
        markdown += `- ID: ${taskData.id}\n`;
        markdown += '\n---\n\n';
      });

      await fs.writeFile(options.output, markdown);
      console.log(chalk.green(`\n✓ Tasks exported to ${options.output}`));

    } catch (error) {
      console.error(chalk.red('Error exporting tasks:'), error);
      process.exit(1);
    }
  });

export default exportCmd;
