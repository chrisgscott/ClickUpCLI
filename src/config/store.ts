import { promises as fs } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { Config } from '../types/clickup.js';

const CONFIG_DIR = join(homedir(), '.task-cli');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export const getConfig = async (): Promise<Config> => {
  try {
    const configData = await fs.readFile(CONFIG_FILE, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    throw new Error('Configuration not found. Please run setup first.');
  }
};

export const updateConfig = async (updates: Partial<Config>): Promise<void> => {
  try {
    // Create config directory if it doesn't exist
    await fs.mkdir(CONFIG_DIR, { recursive: true });

    // Read existing config or create new one
    let config: Config;
    try {
      const configData = await fs.readFile(CONFIG_FILE, 'utf8');
      config = JSON.parse(configData);
    } catch {
      config = {
        clickup: {
          token: '',
        }
      };
    }

    // Update config
    config = {
      ...config,
      ...updates
    };

    // Write updated config
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    throw new Error(`Failed to update config: ${error}`);
  }
};
