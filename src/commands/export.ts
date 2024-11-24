import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs/promises';
import { listTasks } from '../services/clickup.js';
import { getConfig } from '../config/store.js';
import { stringify } from 'yaml';

export const exportCmd = new Command('export')
  .description('Export tasks to a markdown or YAML file with full details')
  .option('-o, --output <file>', 'Output file path (default: tasks.md)')
  .option('-f, --format <format>', 'Output format (markdown or yaml)', 'markdown')
  .action(async (options) => {
    try {
      const config = await getConfig();
      const listId = config.clickup.defaultList;

      if (!listId) {
        console.error(chalk.red('Default list not set. Please run "task config --interactive" first.'));
        process.exit(1);
      }

      const tasks = await listTasks(listId);
      
      if (options.format === 'yaml') {
        const yamlData = {
          tasks: tasks.map(task => ({
            name: task.name,
            description: task.description || '',
            status: task.status.status || '',
            priority: task.priority?.priority === 'urgent' ? 1 :
                     task.priority?.priority === 'high' ? 2 :
                     task.priority?.priority === 'normal' ? 3 :
                     task.priority?.priority === 'low' ? 4 : 3,
            tags: task.tags?.map(tag => tag.name) || []
          }))
        };
        
        const output = stringify(yamlData);
        if (options.output) {
          await fs.writeFile(options.output, output);
          console.log(chalk.green(`\n✓ Tasks exported to ${options.output}`));
        } else {
          console.log(output);
        }
      } else {
        let markdown = '# Tasks\n\n';

        tasks.forEach(task => {
          const taskData = {
            name: task.name,
            description: task.description || '',
            status: task.status.status || '',
            priority: task.priority?.priority || 'Not set',
            url: task.url,
            id: task.id,
            tags: task.tags || []
          };

          markdown += `## ${taskData.name}\n\n`;
          if (taskData.description) {
            markdown += `${taskData.description}\n\n`;
          }
          markdown += `- Status: ${taskData.status}\n`;
          markdown += `- Priority: ${taskData.priority}\n`;
          markdown += `- ID: ${taskData.id}\n`;
          if (taskData.tags.length > 0) {
            markdown += `- Tags: ${taskData.tags.map(t => t.name).join(', ')}\n`;
          }
          markdown += '\n---\n\n';
        });

        if (options.output) {
          await fs.writeFile(options.output, markdown);
          console.log(chalk.green(`\n✓ Tasks exported to ${options.output}`));
        } else {
          console.log(markdown);
        }
      }
    } catch (error) {
      console.error(chalk.red('Error exporting tasks:'), error);
      process.exit(1);
    }
  });

export default exportCmd;
