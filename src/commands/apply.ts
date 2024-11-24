import { Command } from 'commander';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import { parse } from 'yaml';
import { applyConfig } from '../services/config.js';
import { BulkConfig } from '../types/config.js';

export const apply = new Command('apply')
  .description('Apply configuration changes from a YAML file')
  .requiredOption('-f, --file <file>', 'Path to YAML configuration file')
  .option('--dry-run', 'Preview changes without applying them', false)
  .addHelpText('after', `
  The YAML file should contain one or both of these sections:
    - tags: List of tags with their colors
    - tasks: List of tasks with their properties

  Example YAML structure:
    tags:
      - name: "review"
        bg_color: "#FF9900"  # Background color
        fg_color: "#FFFFFF"  # Text color
    
    tasks:
      - name: "Implement feature"
        description: "Feature description"
        priority: 3          # 1: urgent, 2: high, 3: normal, 4: low
        status: "backlog"
        due_date: "2024-02-15"  # Optional, format: YYYY-MM-DD

  A backup of the current configuration will be created before applying changes.
  `)
  .action(async (options) => {
    try {
      // Read and parse YAML file
      const yamlContent = await fs.readFile(options.file, 'utf8');
      console.log('YAML content:', yamlContent);
      const config = parse(yamlContent) as BulkConfig;
      console.log('Parsed config:', config);

      // Apply configuration
      await applyConfig(config, options.dryRun);
      
      if (!options.dryRun) {
        console.log(chalk.green('\nConfiguration applied successfully!'));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('Error applying configuration:'), error.message);
      } else {
        console.error(chalk.red('Error applying configuration'));
      }
      process.exit(1);
    }
  });

export default apply;
