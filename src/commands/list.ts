import { Command } from 'commander';
import chalk from 'chalk';
import { listTasks } from '../services/clickup.js';
import { getConfig } from '../config/store.js';
import { Task } from '../types/clickup.js';

function displayTask(task: Task, indent: string = '', processedTasks: Set<string> = new Set()): void {
  // Prevent infinite recursion by tracking processed tasks
  if (processedTasks.has(task.id)) {
    console.log(`${indent}${chalk.red('⚠')} Circular reference detected for task ${task.id}`);
    return;
  }
  processedTasks.add(task.id);

  const statusColor = task.status.status === 'complete' ? chalk.green : chalk.yellow;
  const priorityColor = task.priority?.priority === 'urgent' ? chalk.red : 
                       task.priority?.priority === 'high' ? chalk.yellow : 
                       chalk.white;

  // Only show bullet point for root tasks
  const bullet = !task.parent?.id ? '►' : '•';
  
  console.log(`${indent}${chalk.blue(bullet)} ${chalk.bold(task.name)} ${chalk.gray(`[${task.id}]`)}`);
  
  const nextIndent = indent + '  ';

  // Show first line of description if available
  if (task.description) {
    const firstLine = task.description.split('\n')[0].trim();
    if (firstLine) {
      console.log(`${nextIndent}${chalk.gray(firstLine)}`);
    }
  }

  // Show status and priority on the same line
  console.log(`${nextIndent}${statusColor(task.status.status || 'N/A')} • ${priorityColor(task.priority?.priority || 'N/A')}`);
  
  // If this task has subtasks, display them with increased indentation
  if (task.subtasks && task.subtasks.length > 0) {
    task.subtasks.forEach(subtask => {
      displayTask(subtask, nextIndent + '  ', processedTasks);
    });
  }
  
  // Add a blank line after root-level tasks for better readability
  if (!task.parent?.id) {
    console.log();
  }
}

export const list = new Command('list')
  .description('List tasks in a hierarchical display, showing task names, descriptions, status, and priority')
  .option('-t, --task <taskId>', 'Filter to show only subtasks of a specific task')
  .option('-s, --status <status>', 'Filter tasks by status (e.g., "in progress", "complete")')
  .option('-p, --priority <priority>', 'Filter tasks by priority (e.g., "urgent", "high", "normal")')
  .action(async () => {
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

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(chalk.red('Error listing tasks:'), error.message);
      } else {
        console.error(chalk.red('An unknown error occurred'));
      }
      process.exit(1);
    }
  });

export default list;
