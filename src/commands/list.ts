import { Command } from 'commander';
import chalk from 'chalk';
import { listTasks } from '../services/clickup.js';
import { getConfig } from '../config/store.js';
import { Task } from '../types/clickup.js';

function displayTask(task: Task, indent: string = '') {
  const statusColor = task.status.status === 'complete' ? chalk.green : chalk.yellow;
  const priorityColor = task.priority?.priority === 'urgent' ? chalk.red : 
                       task.priority?.priority === 'high' ? chalk.yellow : 
                       chalk.white;

  // Only show bullet point for root tasks
  const bullet = !task.parent?.id ? '►' : '•';
  console.log(`${indent}${chalk.blue(bullet)} ${chalk.bold(task.name)} ${chalk.gray(`[${task.id}]`)}`);
  
  const nextIndent = indent + '  ';
  if (task.description) {
    const description = task.description.split('\n')[0]; // Show only first line
    console.log(`${nextIndent}${chalk.gray(description)}`);
  }
  
  console.log(`${nextIndent}${statusColor(task.status.status || 'N/A')} • ${priorityColor(task.priority?.priority || 'N/A')}`);
  
  // If this task has subtasks, display them with increased indentation
  if (task.subtasks && task.subtasks.length > 0) {
    task.subtasks.forEach(subtask => {
      displayTask(subtask, nextIndent + '  ');
    });
  }
  
  if (!task.parent?.id) {
    console.log(); // Add a blank line between top-level tasks
  }
}

export const list = new Command('list')
  .description('List tasks with hierarchical display of subtasks')
  .option('-t, --task <taskId>', 'List subtasks for a specific task')
  .option('-s, --status <status>', 'Filter tasks by status')
  .option('-p, --priority <priority>', 'Filter tasks by priority')
  .action(async (options) => {
    try {
      const config = await getConfig();
      const listId = config.clickup.defaultList;

      if (!listId) {
        console.error(chalk.red('Default list not set. Please run "task config --interactive" first.'));
        process.exit(1);
      }

      const tasks = await listTasks(listId);

      if (tasks.length === 0) {
        console.log(chalk.yellow('\nNo tasks found.'));
      } else {
        console.log(chalk.blue('\nTasks:'));
        // Only display root tasks (tasks without a parent)
        tasks.filter(task => !task.parent?.id).forEach(task => {
          displayTask(task);
        });
      }

    } catch (error) {
      console.error(chalk.red('Error listing tasks:'), error);
      process.exit(1);
    }
  });

export default list;
