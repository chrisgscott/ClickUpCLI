import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { listTasks, updateTask } from '../services/clickup.js';
import { getConfig } from '../config/store.js';
import { Task } from '../types/clickup.js';
import inquirerPrompt from 'inquirer-autocomplete-prompt';

// Register the autocomplete prompt
inquirer.registerPrompt('autocomplete', inquirerPrompt);

interface TaskNode {
  task: Task;
  level: number;
}

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

async function interactiveMode(tasks: Task[]): Promise<void> {
  // Flatten tasks into a list for easier navigation
  const flatTasks: TaskNode[] = [];
  
  function flattenTasks(task: Task, level: number = 0): void {
    flatTasks.push({ task, level });
    if (task.subtasks) {
      task.subtasks.forEach(subtask => flattenTasks(subtask, level + 1));
    }
  }
  
  tasks.forEach(task => flattenTasks(task));

  let shouldContinue = true;
  while (shouldContinue) {
    const choices = flatTasks.map(({ task, level }) => ({
      name: `${'  '.repeat(level)}${task.name} [${task.status.status}]`,
      value: `task:${task.id}`,
      short: task.name
    }));

    // Add explicit exit option
    choices.unshift({
      name: 'Exit',
      value: 'exit',
      short: 'Exit'
    });

    const { action } = await inquirer.prompt([
      {
        type: 'autocomplete',
        name: 'action',
        message: 'Select a task or action (type to filter, ESC/select Exit to quit):',
        source: async (_: unknown, input = ''): Promise<Array<{ name: string; value: string; short: string }>> => {
          if (!input) {
            return choices;
          }
          
          return choices.filter(choice => 
            choice.name.toLowerCase().includes(input.toLowerCase()) ||
            choice.value.includes(input.toLowerCase())
          );
        },
        pageSize: 20
      }
    ]);

    if (!action || action === 'exit') {
      shouldContinue = false;
      continue;
    }

    if (action.startsWith('task:')) {
      const taskId = action.split(':')[1];
      const selectedTask = flatTasks.find(t => t.task.id === taskId)?.task;
      
      if (selectedTask) {
        const { taskAction } = await inquirer.prompt([
          {
            type: 'list',
            name: 'taskAction',
            message: `What would you like to do with "${selectedTask.name}"?`,
            choices: [
              { name: 'View Details', value: 'view' },
              { name: 'Update Status', value: 'status' },
              { name: 'Back to List', value: 'back' }
            ]
          }
        ]);

        if (taskAction === 'view') {
          console.log('\nTask Details:');
          console.log(`ID: ${chalk.blue(selectedTask.id)}`);
          console.log(`Name: ${chalk.bold(selectedTask.name)}`);
          console.log(`Description: ${selectedTask.description || 'N/A'}`);
          console.log(`Status: ${selectedTask.status.status || 'N/A'}`);
          console.log(`Priority: ${selectedTask.priority?.priority || 'N/A'}`);
          console.log(`URL: ${chalk.blue.underline(selectedTask.url)}\n`);
          
          await inquirer.prompt([
            {
              type: 'input',
              name: 'continue',
              message: 'Press enter to continue...'
            }
          ]);
        } else if (taskAction === 'status') {
          const { newStatus } = await inquirer.prompt([
            {
              type: 'list',
              name: 'newStatus',
              message: 'Select new status:',
              choices: [
                'backlog',
                'in progress',
                'review',
                'complete',
                'cancelled'
              ]
            }
          ]);

          try {
            await updateTask(selectedTask.id, { status: newStatus });
            console.log(chalk.green(`\n✓ Updated status of "${selectedTask.name}" to ${newStatus}\n`));
          } catch (error) {
            console.error(chalk.red('\nError updating task status:', error));
          }
        }
      }
    }
  }
}

export const list = new Command('list')
  .description('List tasks in a hierarchical display, showing task names, descriptions, status, and priority')
  .option('-t, --task <taskId>', 'Filter to show only subtasks of a specific task')
  .option('-s, --status <status>', 'Filter tasks by status (e.g., "in progress", "complete")')
  .option('-p, --priority <priority>', 'Filter tasks by priority (e.g., "urgent", "high", "normal")')
  .option('-i, --interactive', 'Enable interactive mode with task navigation and quick actions')
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
        return;
      }

      if (options.interactive) {
        await interactiveMode(tasks);
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
