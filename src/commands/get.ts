import { Command } from 'commander';
import chalk from 'chalk';
import { getTask } from '../services/clickup.js';
import { Task } from '../types/clickup.js';

function displayTask(task: Task, isSubtask: boolean = false) {
  const prefix = isSubtask ? '  ↳ ' : '';
  
  console.log('\nTask Details:');
  console.log(`${prefix}ID: ${task.id}`);
  console.log(`${prefix}Name: ${task.name}`);
  if (task.description) {
    console.log(`${prefix}Description: ${task.description}`);
  }
  console.log(`${prefix}Status: ${task.status.status}`);
  console.log(`${prefix}Priority: ${task.priority?.priority || 'none'}`);
  if (task.parent?.id) {
    console.log(`${prefix}Parent Task: ${task.parent.id}`);
  }

  // Display subtasks if any
  if (task.subtasks && task.subtasks.length > 0) {
    console.log('\nSubtasks:');
    task.subtasks.forEach(subtask => {
      displayTask(subtask, true);
    });
  }
}

export const get = new Command('get')
  .description('Get detailed information about a task, including its description, status, priority, and any subtasks')
  .argument('<taskId>', 'The ID of the task to retrieve')
  .action(async (taskId: string) => {
    try {
      const task = await getTask(taskId);

      console.log('\nTask Details:');
      console.log(`ID: ${chalk.blue(task.id)}`);
      console.log(`Name: ${chalk.bold(task.name)}`);
      if (task.description) {
        console.log(`Description: ${task.description}`);
      }
      console.log(`Status: ${chalk.yellow(task.status.status || 'N/A')}`);
      console.log(`Priority: ${task.priority?.priority === 'urgent' ? chalk.red(task.priority.priority) : 
                               task.priority?.priority === 'high' ? chalk.yellow(task.priority.priority) : 
                               chalk.white(task.priority?.priority || 'N/A')}`);
      
      if (task.parent?.id) {
        console.log(`Parent Task: ${chalk.blue(task.parent.id)}`);
      }

      if (task.subtasks && task.subtasks.length > 0) {
        console.log('\nSubtasks:');
        task.subtasks.forEach(subtask => {
          console.log(`  • ${chalk.bold(subtask.name)} [${chalk.blue(subtask.id)}]`);
        });
      }
    } catch (error) {
      console.error(chalk.red('Error getting task details:'), error);
      process.exit(1);
    }
  });

export default get;
