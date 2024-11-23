import { Command } from 'commander';
import { promises as fs } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { listTasks, getTask } from '../services/clickup.js';
import { Task } from '../types/clickup.js';

export const exportCommand = new Command('export')
  .description('Export tasks to various formats')
  .option('-l, --list <id>', 'List ID to export tasks from')
  .option('-o, --output <path>', 'Output file path', 'TASKS.md')
  .option('--format <format>', 'Export format (markdown)', 'markdown')
  .option('--include-completed', 'Include completed tasks', false)
  .action(async (options) => {
    try {
      const tasks = await listTasks(options.list);
      if (!tasks.length) {
        console.log(chalk.yellow('No tasks found in the specified list.'));
        return;
      }

      const taskTree = new Map<string, Task>();
      const subtaskMap = new Map<string, Task[]>();

      // First pass: collect all tasks and create maps
      for (const task of tasks) {
        if (task.parent && !options.includeCompleted && task.status.status.toLowerCase() === 'complete') {
          continue;
        }
        
        if (task.parent) {
          const subtasks = subtaskMap.get(task.parent) || [];
          subtasks.push(task);
          subtaskMap.set(task.parent, subtasks);
        } else {
          taskTree.set(task.id, task);
        }
      }

      let markdown = '# Task List\n\n';
      
      // Generate markdown for each parent task and its subtasks
      for (const [_, parentTask] of taskTree) {
        if (!options.includeCompleted && parentTask.status.status.toLowerCase() === 'complete') {
          continue;
        }

        const priorityMap: Record<number, string> = {
          1: '🔴',
          2: '🟡',
          3: '🟢',
          4: '⚪️'
        };

        const priority = priorityMap[parentTask.priority.priority] || '⚪️';
        
        markdown += `## ${priority} ${parentTask.name}\n`;
        markdown += `**Status:** ${parentTask.status.status}\n`;
        if (parentTask.description) {
          markdown += `\n${parentTask.description}\n`;
        }

        const subtasks = subtaskMap.get(parentTask.id) || [];
        if (subtasks.length > 0) {
          markdown += '\n### Subtasks\n';
          for (const subtask of subtasks) {
            const subtaskPriority = priorityMap[subtask.priority.priority] || '⚪️';
            markdown += `- ${subtaskPriority} ${subtask.name} (${subtask.status.status})\n`;
            if (subtask.description) {
              markdown += `  > ${subtask.description.replace(/\n/g, '\n  > ')}\n`;
            }
          }
        }

        markdown += '\n---\n\n';
      }

      // Add metadata
      markdown += '\n## Metadata\n';
      markdown += `- Exported: ${new Date().toISOString()}\n`;
      markdown += `- List ID: ${options.list}\n`;
      markdown += `- Total Tasks: ${taskTree.size}\n`;
      markdown += `- Total Subtasks: ${Array.from(subtaskMap.values()).reduce((acc, curr) => acc + curr.length, 0)}\n`;

      // Write to file
      const outputPath = options.output.endsWith('.md') ? options.output : `${options.output}.md`;
      await fs.writeFile(outputPath, markdown);

      console.log(chalk.green(`✓ Tasks exported successfully to ${outputPath}`));
      
      // If the file is in a git repository, suggest adding to .gitignore
      if (!outputPath.includes('..') && !outputPath.startsWith('/')) {
        console.log(chalk.blue('\nTip: If you want to keep this file in sync with ClickUp,'));
        console.log(chalk.blue('you might want to add it to .gitignore:'));
        console.log(chalk.white(`\necho "${outputPath}" >> .gitignore`));
      }

    } catch (error) {
      console.error(chalk.red('Error exporting tasks:'), error);
      process.exit(1);
    }
  });
