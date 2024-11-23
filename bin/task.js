#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const modulePath = dirname(__dirname) + '/dist/index.js';
import(modulePath).catch(err => {
  console.error('Error loading CLI:', err);
  process.exit(1);
});
