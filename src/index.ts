#!/usr/bin/env node

import { Command } from 'commander';
import { configCommand } from './commands/config.js';
import { addCommand } from './commands/add.js';
import { listCommand } from './commands/list.js';
import { updateCommand } from './commands/update.js';
import { exportCommand } from './commands/export.js';

const program = new Command();

program
  .name('task')
  .description('CLI tool for managing ClickUp tasks')
  .version('1.0.0');

program.addCommand(configCommand);
program.addCommand(addCommand);
program.addCommand(listCommand);
program.addCommand(updateCommand);
program.addCommand(exportCommand);

program.parse();
