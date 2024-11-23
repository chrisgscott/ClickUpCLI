import { Command } from 'commander';
import chalk from 'chalk';
import { listTasks } from '../services/clickup.js';
import { getConfig } from '../config/store.js';
import { Task } from '../types/clickup.js';

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(parseInt(dateString));
    return date.toLocaleString();
  } catch {
    return 'N/A';
  }
}

function displayTask(task: Task, indent: string = '', verbose: boolean = false) {
  const statusColor = task.status.status === 'complete' ? chalk.green : chalk.yellow;
  const priorityColor = task.priority?.priority === 'urgent' ? chalk.red : 
                       task.priority?.priority === 'high' ? chalk.yellow : 
                       chalk.white;

  // Only show bullet point for root tasks
  const bullet = !task.parent?.id ? '►' : '•';
  
  if (verbose && !task.parent?.id) {
    // Add a separator line before each root task in verbose mode
    console.log(chalk.dim('─'.repeat(80)));
  }
  
  console.log(`${indent}${chalk.blue(bullet)} ${chalk.bold(task.name)} ${chalk.gray(`[${task.id}]`)}`);
  
  const nextIndent = indent + '  ';

  if (verbose) {
    // Show all task details in verbose mode
    if (task.description) {
      console.log(`${nextIndent}${chalk.dim('Description:')} ${task.description}`);
    }
    console.log(`${nextIndent}${chalk.dim('Status:')} ${statusColor(task.status.status || 'N/A')}`);
    console.log(`${nextIndent}${chalk.dim('Priority:')} ${priorityColor(task.priority?.priority || 'N/A')}`);
    console.log(`${nextIndent}${chalk.dim('Created:')} ${formatDate(task.date_created)}`);
    console.log(`${nextIndent}${chalk.dim('URL:')} ${chalk.blue.underline(task.url)}`);
    if (task.parent?.id) {
      console.log(`${nextIndent}${chalk.dim('Parent Task:')} ${chalk.gray(task.parent.id)}`);
    }
    if (task.space?.name) {
      console.log(`${nextIndent}${chalk.dim('Space:')} ${task.space.name}`);
    }
    console.log(`${nextIndent}${chalk.dim('List ID:')} ${task.list.id}`);
  } else {
    if (task.description) {
      const description = task.description.split('\n')[0]; // Show only first line
      console.log(`${nextIndent}${chalk.gray(description)}`);
    }
    console.log(`${nextIndent}${statusColor(task.status.status || 'N/A')} • ${priorityColor(task.priority?.priority || 'N/A')}`);
  }
  
  // If this task has subtasks, display them with increased indentation
  if (task.subtasks && task.subtasks.length > 0) {
    if (verbose) {
      console.log(`${nextIndent}${chalk.dim('Subtasks:')} ${task.subtasks.length}`);
    }
    task.subtasks.forEach(subtask => {
      displayTask(subtask, nextIndent + '  ', verbose);
    });
  }
  
  if (!task.parent?.id || verbose) {
    console.log(); // Add a blank line between tasks in verbose mode or between top-level tasks
  }
}

export const list = new Command('list')
  .description('List tasks with hierarchical display of subtasks')
  .option('-t, --task <taskId>', 'List subtasks for a specific task')
  .option('-s, --status <status>', 'Filter tasks by status')
  .option('-p, --priority <priority>', 'Filter tasks by priority')
  .option('-v, --verbose', 'Show detailed information for each task')
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
        if (options.verbose) {
          // Add a header separator in verbose mode
          console.log(chalk.dim('═'.repeat(80)));
        }
        // Only display root tasks (tasks without a parent)
        tasks.filter(task => !task.parent?.id).forEach(task => {
          displayTask(task, '', options.verbose);
        });
        if (options.verbose) {
          // Add a footer separator in verbose mode
          console.log(chalk.dim('═'.repeat(80)));
        }
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(chalk.red('Error listing tasks:'), error.message);
      } else {
        console.error(chalk.red('Error listing tasks: An unknown error occurred'));
      }
      process.exit(1);
    }
  });

export default list;
