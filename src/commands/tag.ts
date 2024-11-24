import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { getConfig } from '../config/store.js';
import { getSpaceTags, createTag, deleteTag } from '../services/clickup.js';

export const tag = new Command('tag')
  .description('Manage tags in your ClickUp space')
  .option('-l, --list', 'List all tags in the space')
  .option('-a, --add', 'Add a new tag')
  .option('-d, --delete', 'Delete a tag')
  .option('-i, --interactive', 'Interactive mode')
  .action(async (options): Promise<void> => {
    try {
      const config = await getConfig();
      const spaceId = config.clickup.defaultSpace;

      if (!spaceId) {
        console.error(chalk.red('Default space not set. Please run "task config --interactive" first.'));
        process.exit(1);
      }

      // Get current tags
      const currentTags = await getSpaceTags(spaceId);

      if (options.interactive) {
        const action = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
              { name: 'List all tags', value: 'list' },
              { name: 'Add a new tag', value: 'add' },
              { name: 'Delete a tag', value: 'delete' }
            ]
          }
        ]);

        switch (action.action) {
          case 'list':
            options.list = true;
            break;
          case 'add':
            options.add = true;
            break;
          case 'delete':
            options.delete = true;
            break;
        }
      }

      if (options.list || (!options.add && !options.delete && !options.interactive)) {
        if (currentTags.length === 0) {
          console.log(chalk.yellow('No tags found in this space.'));
          return;
        }

        console.log('\nCurrent tags:');
        currentTags.forEach((tag): void => {
          console.log(chalk.hex(tag.tag_bg).bgHex(tag.tag_fg)(` ${tag.name} `));
        });
        return;
      }

      if (options.add) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Enter tag name:',
            validate: (input: string): boolean | string => input.length > 0 ? true : 'Tag name is required'
          },
          {
            type: 'input',
            name: 'bg',
            message: 'Enter background color (hex):',
            default: '#000000',
            validate: (input: string): boolean | string => /^#[0-9A-Fa-f]{6}$/.test(input) ? true : 'Invalid hex color'
          },
          {
            type: 'input',
            name: 'fg',
            message: 'Enter text color (hex):',
            default: '#ffffff',
            validate: (input: string): boolean | string => /^#[0-9A-Fa-f]{6}$/.test(input) ? true : 'Invalid hex color'
          }
        ]);

        const newTag = await createTag(spaceId, answers.name, answers.bg, answers.fg);
        console.log(chalk.green('\n✓ Tag created successfully!'));
        console.log('Created tag:', chalk.hex(newTag.tag_bg).bgHex(newTag.tag_fg)(` ${newTag.name} `));
        return;
      }

      if (options.delete) {
        if (currentTags.length === 0) {
          console.log(chalk.yellow('No tags to delete.'));
          return;
        }

        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'tag',
            message: 'Select a tag to delete:',
            choices: currentTags.map(t => ({
              name: chalk.hex(t.tag_bg).bgHex(t.tag_fg)(` ${t.name} `),
              value: t.name
            }))
          },
          {
            type: 'confirm',
            name: 'confirm',
            message: 'Are you sure you want to delete this tag? This cannot be undone.',
            default: false
          }
        ]);

        if (answers.confirm) {
          await deleteTag(spaceId, answers.tag);
          console.log(chalk.green('\n✓ Tag deleted successfully!'));
        } else {
          console.log(chalk.blue('Tag deletion cancelled.'));
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(chalk.red('Error managing tags:'), error.message);
      } else {
        console.error(chalk.red('Error managing tags: An unknown error occurred'));
      }
      process.exit(1);
    }
  });

export default tag;
