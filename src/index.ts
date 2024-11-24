#!/usr/bin/env node

import { program } from 'commander';
import add from './commands/add.js';
import list from './commands/list.js';
import config from './commands/config.js';
import update from './commands/update.js';
import exportCmd from './commands/export.js';
import get from './commands/get.js';
import del from './commands/delete.js';

program
  .name('task')
  .description('CLI tool for managing tasks in ClickUp')
  .version('1.0.7');

program.addCommand(add);
program.addCommand(list);
program.addCommand(config);
program.addCommand(update);
program.addCommand(exportCmd);
program.addCommand(get);
program.addCommand(del);

program.parse(process.argv);
