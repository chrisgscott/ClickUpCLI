import { stringify } from 'yaml';
import { promises as fs } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import { createTask, getListStatuses, getSpaceTags, createTag, manageStatus } from './clickup.js';
import { getConfig } from '../config/store.js';
import { BulkConfig, ValidationError, TaskConfig, TagConfig } from '../types/config.js';

const CONFIG_DIR = join(homedir(), '.task-cli');
const BACKUP_DIR = join(CONFIG_DIR, 'backups');

export async function exportConfig(type?: 'tags' | 'status' | 'all'): Promise<string> {
  const config = await getConfig();
  const spaceId = config.clickup.defaultSpace;
  const listId = config.clickup.defaultList;

  if (!spaceId || !listId) {
    throw new Error('Default space and list must be configured');
  }

  const exportData: BulkConfig = {};

  if (type === 'tags' || type === 'all') {
    const tags = await getSpaceTags(spaceId);
    exportData.tags = tags.map(tag => ({
      name: tag.name,
      bg_color: tag.tag_bg,
      fg_color: tag.tag_fg
    }));
  }

  if (type === 'status' || type === 'all') {
    const statuses = await getListStatuses(listId);
    exportData.statuses = statuses.map(status => ({
      name: status.status,
      color: status.color || '#000000',
      order: status.orderindex || 0
    }));
  }

  return stringify(exportData);
}

function validateConfig(config: BulkConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!config) {
    errors.push({
      type: 'config',
      item: 'root',
      message: 'Configuration object is required'
    });
    return errors;
  }

  // Validate tags
  if (config.tags) {
    for (const tag of config.tags) {
      if (!tag.name) {
        errors.push({
          type: 'tag',
          item: 'name',
          message: 'Tag name is required'
        });
      }
      if (!tag.bg_color) {
        errors.push({
          type: 'tag',
          item: tag.name || 'unknown',
          message: 'Background color is required'
        });
      }
      if (!tag.fg_color) {
        errors.push({
          type: 'tag',
          item: tag.name || 'unknown',
          message: 'Foreground color is required'
        });
      }
    }
  }

  // Validate statuses
  if (config.statuses) {
    const orders = config.statuses.map(s => s.order);
    const expectedOrders = Array.from({ length: orders.length }, (_, i) => i + 1);
    const hasValidOrders = orders.every(o => expectedOrders.includes(o));

    for (const status of config.statuses) {
      if (!status.name) {
        errors.push({
          type: 'status',
          item: 'name',
          message: 'Status name is required'
        });
      }
      if (!status.color) {
        errors.push({
          type: 'status',
          item: status.name || 'unknown',
          message: 'Status color is required'
        });
      }
    }

    if (!hasValidOrders) {
      errors.push({
        type: 'status',
        item: 'order',
        message: 'Status orders must be sequential starting from 1'
      });
    }
  }

  // Validate tasks
  if (config.tasks) {
    for (const task of config.tasks) {
      if (!task.name) {
        errors.push({
          type: 'task',
          item: 'name',
          message: 'Task name is required'
        });
      }
      if (!task.priority) {
        errors.push({
          type: 'task',
          item: task.name || 'unknown',
          message: 'Task priority is required'
        });
      }
      if (!task.status) {
        errors.push({
          type: 'task',
          item: task.name || 'unknown',
          message: 'Task status is required'
        });
      }
      // Validate priority is a number between 1 and 4
      if (task.priority && (task.priority < 1 || task.priority > 4)) {
        errors.push({
          type: 'task',
          item: task.name || 'unknown',
          message: 'Task priority must be between 1 and 4'
        });
      }
    }
  }

  return errors;
}

async function applyTaskChanges(tasks: TaskConfig[], dryRun: boolean = false): Promise<void> {
  const config = await getConfig();
  const listId = config.clickup.defaultList;

  if (!listId) {
    throw new Error('Default list must be configured');
  }

  for (const task of tasks) {
    if (dryRun) {
      console.log(chalk.blue(`Would create task: ${task.name}`));
      if (task.description) console.log(chalk.blue(`  Description: ${task.description}`));
      console.log(chalk.blue(`  Priority: ${task.priority}`));
      console.log(chalk.blue(`  Status: ${task.status}`));
      if (task.tags) console.log(chalk.blue(`  Tags: ${task.tags.join(', ')}`));
      continue;
    }

    try {
      await createTask(listId, task.name, task.description || '', task.priority, task.status);
      console.log(chalk.green(`Created task: ${task.name}`));
    } catch (error) {
      console.error(chalk.red(`Failed to create task ${task.name}:`), error);
    }
  }
}

async function applyTagChanges(spaceId: string, tags: TagConfig[]): Promise<void> {
  for (const tag of tags) {
    try {
      await createTag(spaceId, tag.name, tag.bg_color, tag.fg_color);
      console.log(`Created tag: ${tag.name}`);
    } catch (error) {
      console.error(`Failed to create tag "${tag.name}":`, error);
    }
  }
}

async function applyStatusChanges(listId: string, statuses: { name: string; color: string; order: number }[], dryRun: boolean = false): Promise<void> {
  if (dryRun) {
    console.log(chalk.blue('\nStatus changes to be applied:'));
    for (const status of statuses) {
      console.log(`  - ${status.name} (${status.color}, order: ${status.order})`);
    }
    return;
  }

  console.log(chalk.blue('\nApplying status changes...'));

  for (const status of statuses) {
    try {
      await manageStatus(
        listId,
        status.name,
        status.color,
        status.order
      );
      console.log(chalk.green(`  ✓ Managed status: ${status.name}`));
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red(`  ✗ ${error.message}`));
      } else {
        console.error(chalk.red(`  ✗ Failed to manage status ${status.name}`));
      }
    }
  }
}

export async function applyConfig(config: BulkConfig, dryRun: boolean = false): Promise<void> {
  // Validate configuration
  const errors = validateConfig(config);
  if (errors.length > 0) {
    console.error(chalk.red('\nConfiguration validation failed:'));
    for (const error of errors) {
      console.error(`  - ${error.message}`);
    }
    throw new Error('Invalid configuration');
  }

  // Create backup
  if (!dryRun) {
    await createBackup();
  }

  const clickupConfig = await getConfig();
  const spaceId = clickupConfig.clickup.defaultSpace;
  const listId = clickupConfig.clickup.defaultList;

  if (!spaceId || !listId) {
    throw new Error('Default space and list must be configured');
  }

  // Apply changes
  if (config.tags) {
    await applyTagChanges(spaceId, config.tags);
  }

  if (config.statuses) {
    await applyStatusChanges(listId, config.statuses, dryRun);
  }

  if (config.tasks) {
    await applyTaskChanges(config.tasks, dryRun);
  }
}

async function createBackup(): Promise<void> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = join(BACKUP_DIR, `config-${timestamp}.yml`);
    
    // Create backup directory if it doesn't exist
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    
    // Export current config and save to backup file
    const config = await exportConfig('all');
    await fs.writeFile(backupFile, config);
    
    console.log(chalk.green(`Created backup: ${backupFile}`));
  } catch (error) {
    console.error(chalk.yellow('Warning: Failed to create backup'), error);
  }
}
