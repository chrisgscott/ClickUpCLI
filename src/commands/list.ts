import { Command } from 'commander';
import chalk from 'chalk';
import { listTasks, getTask } from '../services/clickup.js';
import { Task } from '../types/clickup.js';

export const listCommand = new Command('list')
  .description('List tasks')
  .option('-l, --list <id>', 'List ID to fetch tasks from')
  .option('-t, --task <id>', 'Task ID to list subtasks for')
  .action(async (options) => {
    try {
      let tasks: Task[];

      if (options.task) {
        // List subtasks for a specific task
        const parentTask = await getTask(options.task);
        tasks = await listTasks(parentTask.list.id);
        tasks = tasks.filter(task => task.parent === options.task);
        
        console.log(chalk.blue(`\nSubtasks for task ${options.task}:\n`));
      } else {
        // List all tasks in the list
        tasks = await listTasks(options.list);
      }

      if (!tasks.length) {
        console.log(chalk.yellow('No tasks found.'));
        return;
      }

      console.log('\nTasks:');
      tasks.forEach((task, index) => {
        const priorityMap: Record<number, string> = {
          1: '🔴',
          2: '🟡',
          3: '🟢',
          4: '⚪️'
        };

        const priority = priorityMap[task.priority.priority] || '⚪️';
        console.log(
          `${index + 1}. [${task.id}] ${task.name} (${task.status.status}) [P${priority}]`
        );
      });
      console.log();

    } catch (error) {
      console.error(chalk.red('Error listing tasks:'), error);
      process.exit(1);
    }
  });
