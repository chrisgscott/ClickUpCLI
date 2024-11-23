import { promises as fs } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { createInterface } from 'readline';
import chalk from 'chalk';

const CONFIG_DIR = join(homedir(), '.task-cli');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

async function setup() {
  try {
    // Create config directory if it doesn't exist
    await fs.mkdir(CONFIG_DIR, { recursive: true });

    // Check if config file already exists
    try {
      await fs.access(CONFIG_FILE);
      console.log(chalk.yellow('Configuration already exists. To reconfigure, edit ~/.task-cli/config.json'));
      return;
    } catch {
      // Config file doesn't exist, continue with setup
    }

    console.log(chalk.blue('Welcome to Task CLI! Let\'s get you set up.'));
    console.log(chalk.blue('\nTo use this CLI, you\'ll need a ClickUp API token.'));
    console.log(chalk.blue('You can get one from: https://app.clickup.com/settings/apps\n'));

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const token = await new Promise<string>((resolve) => {
      rl.question(chalk.green('Please enter your ClickUp API token: '), (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });

    // Create initial config
    const config = {
      clickup: {
        token
      }
    };

    // Write config file
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));

    console.log(chalk.green('\n✓ Configuration saved successfully!'));
    console.log(chalk.blue('\nTo get started, try these commands:'));
    console.log(chalk.white('  task list          # List all tasks'));
    console.log(chalk.white('  task add           # Create a new task'));
    console.log(chalk.white('  task update        # Update a task'));
    console.log(chalk.white('  task --help        # Show all commands\n'));

  } catch (error) {
    console.error(chalk.red('Error during setup:'), error);
    process.exit(1);
  }
}

setup();
