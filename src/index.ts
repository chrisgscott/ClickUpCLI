#!/usr/bin/env node

import { Command } from 'commander';
import { add } from './commands/add.js';
import { list } from './commands/list.js';
import { update } from './commands/update.js';
import { exportCmd } from './commands/export.js';
import { get } from './commands/get.js';

const program = new Command();

program
  .name('task')
  .description('A CLI tool for managing tasks')
  .version('1.0.5');

program
  .addCommand(add)
  .addCommand(list)
  .addCommand(update)
  .addCommand(exportCmd)
  .addCommand(get);

program.parse(process.argv);
