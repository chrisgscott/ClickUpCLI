import { Command } from 'commander';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import { listTasks } from '../services/clickup.js';
import { getConfig } from '../config/store.js';

export default function exportCommand(program: Command) {
  program
    .command('export')
    .description('Export tasks to a markdown file')
    .option('-o, --output <file>', 'Output file path', 'tasks.md')
    .option('-l, --list <id>', 'List ID (overrides default)')
    .action(async (options) => {
      try {
        const config = await getConfig();
        const listId = options.list || config.clickup.defaultList;

        if (!listId) {
          console.error(chalk.red('No list ID provided. Please run "task config --interactive" first.'));
          process.exit(1);
        }

        const tasks = await listTasks(listId);

        let markdown = '# Tasks\n\n';

        tasks.forEach(task => {
          // Main task
          markdown += `## ${task.name}\n\n`;
          if (task.description) {
            markdown += `${task.description}\n\n`;
          }
          markdown += `- Status: ${task.status.status}\n`;
          markdown += `- Priority: ${task.priority.priority}\n`;
          markdown += `- ID: ${task.id}\n`;
          if (task.parent) {
            markdown += `- Parent Task: ${task.parent}\n`;
          }
          markdown += '\n---\n\n';
        });

        await fs.writeFile(options.output, markdown);
        console.log(chalk.green(`\n✓ Tasks exported to ${options.output}`));

      } catch (error) {
        console.error(chalk.red('Error exporting tasks:'), error);
        process.exit(1);
      }
    });
}
