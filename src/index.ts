#!/usr/bin/env node

import { Command } from 'commander';
import addCommand from './commands/add.js';
import exportCommand from './commands/export.js';
import configCommand from './commands/config.js';
import listCommand from './commands/list.js';
import updateCommand from './commands/update.js';

const program = new Command();

program
  .name('task')
  .description('CLI to manage ClickUp tasks')
  .version('1.0.2');

// Add commands
addCommand(program);
configCommand(program);
exportCommand(program);
listCommand(program);
updateCommand(program);

program.parse();
