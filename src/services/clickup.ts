import axios, { AxiosInstance } from 'axios';
import { promises as fs } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { Config, Task, Priority, TaskStatus } from '../types/clickup.js';
import { getConfig } from '../config/store.js';

const CONFIG_FILE = join(homedir(), '.task-cli', 'config.json');
const BASE_URL = 'https://api.clickup.com/api/v2';

const getAxiosInstance = async (): Promise<AxiosInstance> => {
  const config = await getConfig();
  return axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': config.clickup.token
    }
  });
};

const makeRequest = async <T>(request: () => Promise<T>): Promise<T> => {
  const maxRetries = 3;
  const retryDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await request();
    } catch (error: any) {
      if (attempt === maxRetries || (error.response?.status !== 429 && error.response?.status !== 504)) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }

  throw new Error('Max retries exceeded');
};

export async function createTask(
  name: string,
  description?: string,
  priority?: number,
  status?: string
): Promise<Task> {
  const config = await getConfig();
  const { token, defaultList } = config.clickup;

  if (!defaultList) {
    throw new Error('No list ID specified. Please set a default list or provide a list ID.');
  }

  const response = await axios.post(
    `${BASE_URL}/list/${defaultList}/task`,
    {
      name,
      description,
      priority: priority ? { priority } : undefined,
      status: status || undefined
    },
    {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

export async function createSubtask(
  parentId: string,
  name: string,
  description?: string,
  priority?: number,
  status?: string
): Promise<Task> {
  const config = await getConfig();
  const { token } = config.clickup;

  const response = await axios.post(
    `${BASE_URL}/task/${parentId}/subtask`,
    {
      name,
      description,
      priority: priority ? { priority } : undefined,
      status: status || undefined
    },
    {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

export async function listTasks(listId?: string): Promise<Task[]> {
  const config = await getConfig();
  const { token, defaultList } = config.clickup;
  const targetListId = listId || defaultList;

  if (!targetListId) {
    throw new Error('No list ID specified. Please set a default list or provide a list ID.');
  }

  const response = await axios.get(
    `${BASE_URL}/list/${targetListId}/task`,
    {
      headers: {
        'Authorization': token
      }
    }
  );

  return response.data.tasks;
}

export async function getTask(taskId: string): Promise<Task> {
  const config = await getConfig();
  const { token } = config.clickup;

  const response = await axios.get(
    `${BASE_URL}/task/${taskId}`,
    {
      headers: {
        'Authorization': token
      }
    }
  );

  return response.data;
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  const config = await getConfig();
  const { token } = config.clickup;

  const response = await axios.put(
    `${BASE_URL}/task/${taskId}`,
    updates,
    {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

export async function getListStatuses(listId: string): Promise<TaskStatus[]> {
  const config = await getConfig();
  const { token } = config.clickup;

  const response = await axios.get(
    `${BASE_URL}/list/${listId}`,
    {
      headers: {
        'Authorization': token
      }
    }
  );

  return response.data.statuses;
}

export async function getWorkspaces(): Promise<any[]> {
  const api = await getAxiosInstance();
  return makeRequest(async () => {
    const response = await api.get('/team');
    return response.data.teams;
  });
}

export async function getSpaces(workspaceId: string): Promise<any[]> {
  const api = await getAxiosInstance();
  return makeRequest(async () => {
    const response = await api.get(`/team/${workspaceId}/space`);
    return response.data.spaces;
  });
}

export async function getLists(spaceId: string): Promise<any[]> {
  const api = await getAxiosInstance();
  return makeRequest(async () => {
    const response = await api.get(`/space/${spaceId}/list`);
    return response.data.lists;
  });
}

export async function listSubtasks(taskId: string): Promise<Task[]> {
  const api = await getAxiosInstance();
  return makeRequest(async () => {
    // First get the parent task to find its list ID
    const parentTask = await getTask(taskId);
    // Then list all tasks in that list and filter by parent
    const response = await api.get(`/list/${parentTask.list.id}/task`, {
      params: {
        parent: taskId
      }
    });
    return response.data.tasks;
  });
}
