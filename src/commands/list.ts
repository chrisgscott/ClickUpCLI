import { Command } from 'commander';
import chalk from 'chalk';
import { listTasks } from '../services/clickup.js';
import { Task } from '../types/clickup.js';

function displayTask(task: Task, indent: number = 0): void {
  const bullet = indent === 0 ? '►' : '↳';
  const padding = ' '.repeat(indent * 2);
  const taskLine = `${padding}${bullet} ${task.name} [${task.id}]`;
  
  // Show description if it exists
  const description = task.description ? `\n${padding}  ${task.description}` : '';
  
  // Show status and priority
  const status = task.status?.status || 'N/A';
  const priority = task.priority?.priority || 'N/A';
  const details = `${status} • ${priority}`;

  console.log(`${taskLine}${description}\n${padding}  ${details}\n`);

  // Display subtasks if they exist
  if (task.subtasks && task.subtasks.length > 0) {
    task.subtasks.forEach(subtask => {
      displayTask(subtask, indent + 1);
    });
  }
}

export const list = new Command('list')
  .description('List all tasks')
  .action(async () => {
    try {
      const tasks = await listTasks();
      console.log('\nTasks:');
      tasks.forEach(task => displayTask(task));
    } catch (error) {
      console.error(chalk.red('Error listing tasks:'), error);
      process.exit(1);
    }
  });
