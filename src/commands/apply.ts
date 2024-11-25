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
      - name: "Project Setup"
        description: "Initial project setup"
        priority: 2          # 1: urgent, 2: high, 3: normal, 4: low
        status: "to do"
        due_date: "2024-03-15"  # Optional, format: YYYY-MM-DD
        subtasks:           # Optional list of subtasks
          - name: "Environment Setup"
            description: "Set up development environment"
            priority: 2
            status: "to do"
            subtasks:     # Supports unlimited nesting of subtasks
              - name: "Install Dependencies"
                description: "Install project dependencies"
                priority: 3
                status: "to do"

  Task Properties:
    - name: Required, string
    - description: Optional, string
    - priority: Optional, number (1: urgent, 2: high, 3: normal, 4: low)
    - status: Optional, string
    - due_date: Optional, string (format: YYYY-MM-DD)
    - subtasks: Optional, array of tasks with the same properties

  Features:
    - Unlimited nesting of subtasks
    - Automatic parent-child relationship handling
    - Bulk creation of entire task hierarchies
    - Preview changes with --dry-run option

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
