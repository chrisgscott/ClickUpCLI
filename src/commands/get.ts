import { Command } from 'commander';
import chalk from 'chalk';
import { getTask } from '../services/clickup.js';
import { Task } from '../types/clickup.js';

async function displayTaskDetails(task: Task, showSubtasks: boolean = true): Promise<void> {
  console.log('\nTask Details:');
  console.log(`ID: ${task.id}`);
  console.log(`Name: ${task.name}`);
  if (task.description) {
    console.log(`Description: ${task.description}`);
  }
  console.log(`Status: ${task.status.status}`);
  console.log(`Priority: ${task.priority?.priority || 'N/A'}`);

  if (task.parent) {
    const parentId = typeof task.parent === 'string' ? task.parent : task.parent.id;
    const parentTask = await getTask(parentId);
    console.log(`\nParent Task: ${parentTask.name} [${parentId}]`);
  }

  if (showSubtasks && task.subtasks && task.subtasks.length > 0) {
    console.log('\nSubtasks:');
    for (const subtask of task.subtasks) {
      console.log(`  ↳ ${subtask.name} [${subtask.id}]`);
      console.log(`    Status: ${subtask.status.status}`);
      console.log(`    Priority: ${subtask.priority?.priority || 'N/A'}`);
    }
  }
}

async function displayTaskHierarchy(task: Task, visited = new Set<string>()): Promise<void> {
  // Prevent infinite recursion
  if (visited.has(task.id)) {
    return;
  }
  visited.add(task.id);

  // Display current task
  await displayTaskDetails(task, false);

  // Get parent task if it exists
  if (task.parent) {
    const parentId = typeof task.parent === 'string' ? task.parent : task.parent.id;
    console.log('\nParent Task:');
    const parentTask = await getTask(parentId);
    await displayTaskHierarchy(parentTask, visited);
  }

  // Get subtasks if they exist
  if (task.subtasks && task.subtasks.length > 0) {
    console.log('\nSubtasks:');
    for (const subtask of task.subtasks) {
      await displayTaskDetails(subtask, false);
    }
  }
}

export const get = new Command('get')
  .description('Get detailed information about a task, including its full description, status, priority, and metadata')
  .argument('<taskId>', 'The ID of the task to retrieve')
  .action(async (taskId: string) => {
    try {
      const task = await getTask(taskId);
      await displayTaskHierarchy(task);
    } catch (error) {
      console.error(chalk.red('Error getting task details:'), error);
      process.exit(1);
    }
  });

export default get;
