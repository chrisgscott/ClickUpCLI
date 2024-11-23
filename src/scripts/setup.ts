import { promises as fs } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import axios from 'axios';

const CONFIG_DIR = join(homedir(), '.task-cli');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
const BASE_URL = 'https://api.clickup.com/api/v2';

interface Workspace {
  id: string;
  name: string;
}

interface Space {
  id: string;
  name: string;
}

interface List {
  id: string;
  name: string;
}

async function getWorkspaces(token: string): Promise<Workspace[]> {
  const response = await axios.get<{ teams: Workspace[] }>(`${BASE_URL}/team`, {
    headers: { Authorization: token }
  });
  return response.data.teams;
}

async function getSpaces(token: string, workspaceId: string): Promise<Space[]> {
  const response = await axios.get<{ spaces: Space[] }>(`${BASE_URL}/team/${workspaceId}/space`, {
    headers: { Authorization: token }
  });
  return response.data.spaces;
}

async function getLists(token: string, spaceId: string): Promise<List[]> {
  const response = await axios.get<{ lists: List[] }>(`${BASE_URL}/space/${spaceId}/list`, {
    headers: { Authorization: token }
  });
  return response.data.lists;
}

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

    // Get API token
    const { token } = await inquirer.prompt([
      {
        type: 'password',
        name: 'token',
        message: 'Please enter your ClickUp API token:',
        validate: (input) => input.length > 0 ? true : 'API token is required'
      }
    ]);

    console.log(chalk.blue('\nFetching your workspaces...'));
    const workspaces = await getWorkspaces(token);
    
    if (workspaces.length === 0) {
      throw new Error('No workspaces found in your ClickUp account');
    }

    // Select workspace
    const { workspaceId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'workspaceId',
        message: 'Select your default workspace:',
        choices: workspaces.map(w => ({ name: w.name, value: w.id }))
      }
    ]);

    console.log(chalk.blue('\nFetching spaces...'));
    const spaces = await getSpaces(token, workspaceId);

    if (spaces.length === 0) {
      throw new Error('No spaces found in the selected workspace');
    }

    // Select space
    const { spaceId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'spaceId',
        message: 'Select your default space:',
        choices: spaces.map(s => ({ name: s.name, value: s.id }))
      }
    ]);

    console.log(chalk.blue('\nFetching lists...'));
    const lists = await getLists(token, spaceId);

    if (lists.length === 0) {
      throw new Error('No lists found in the selected space');
    }

    // Select list
    const { listId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'listId',
        message: 'Select your default list:',
        choices: lists.map(l => ({ name: l.name, value: l.id }))
      }
    ]);

    // Create initial config
    const config = {
      clickup: {
        token,
        defaultWorkspace: workspaceId,
        defaultSpace: spaceId,
        defaultList: listId
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
