#!/usr/bin/env node

import { program } from 'commander';
import { createRequire } from 'module';
import add from './commands/add.js';
import list from './commands/list.js';
import config from './commands/config.js';
import update from './commands/update.js';
import exportCmd from './commands/export.js';
import get from './commands/get.js';
import del from './commands/delete.js';
import status from './commands/status.js';
import tag from './commands/tag.js';
import exportConfig from './commands/export-config.js';
import apply from './commands/apply.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

program
  .name('task')
  .description('CLI tool for managing tasks in ClickUp')
  .version(version);

program.addCommand(add);
program.addCommand(list);
program.addCommand(config);
program.addCommand(update);
program.addCommand(exportCmd);
program.addCommand(get);
program.addCommand(del);
program.addCommand(status);
program.addCommand(tag);
program.addCommand(exportConfig);
program.addCommand(apply);

program.parse(process.argv);
