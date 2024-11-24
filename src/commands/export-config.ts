import { Command } from 'commander';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import { exportConfig } from '../services/config.js';

export const exportConfigCmd = new Command('export-config')
  .description('Export current configuration to YAML')
  .option('-t, --type <type>', 'Type of configuration to export (tags, status, or all)', 'all')
  .option('-o, --output <file>', 'Output file (defaults to stdout)')
  .action(async (options) => {
    try {
      const type = options.type as 'tags' | 'status' | 'all';
      if (!['tags', 'status', 'all'].includes(type)) {
        console.error(chalk.red('Invalid type. Must be one of: tags, status, all'));
        process.exit(1);
      }

      const yaml = await exportConfig(type);

      if (options.output) {
        await fs.writeFile(options.output, yaml);
        console.log(chalk.green(`Configuration exported to ${options.output}`));
      } else {
        console.log(yaml);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('Error exporting configuration:'), error.message);
      } else {
        console.error(chalk.red('Error exporting configuration'));
      }
      process.exit(1);
    }
  });

export default exportConfigCmd;
