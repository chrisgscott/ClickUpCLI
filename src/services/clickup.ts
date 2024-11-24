import axios from 'axios';
import { promises as fs } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { Config, Priority, Task, TaskStatus, UpdateTaskParams, Tag } from '../types/clickup.js';
import { getConfig } from '../config/store.js';

const CONFIG_FILE = join(homedir(), '.task-cli', 'config.json');
const BASE_URL = 'https://api.clickup.com/api/v2';

const getAxiosInstance = async () => {
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

// Priority mapping based on ClickUp's API
export const PRIORITY_MAP: { [key: number]: Priority } = {
  1: { id: "1", priority: "urgent", color: "#f50000", orderindex: "1" },
  2: { id: "2", priority: "high", color: "#ffcc00", orderindex: "2" },
  3: { id: "3", priority: "normal", color: "#6fddff", orderindex: "3" },
  4: { id: "4", priority: "low", color: "#d8d8d8", orderindex: "4" }
};

export async function createTask(
  listId: string,
  name: string,
  description?: string,
  priority?: number,
  status?: string
): Promise<Task> {
  const config = await getConfig();
  const { token } = config.clickup;

  if (!listId) {
    throw new Error('No list ID specified. Please set a default list or provide a list ID.');
  }

  const axiosInstance = await getAxiosInstance();
  const response = await axiosInstance.post<Task>(
    `/list/${listId}/task`,
    {
      name,
      description,
      priority: priority || undefined,
      status
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
  const axiosInstance = await getAxiosInstance();
  
  // First get the parent task to get its list ID
  const parentTask = await getTask(parentId);
  if (!parentTask.list?.id) {
    throw new Error('Parent task does not have a valid list ID');
  }

  const payload = {
    name,
    description,
    parent: parentId,  
    priority: priority,
    status: status
  };

  const response = await axiosInstance.post<Task>(
    `/list/${parentTask.list.id}/task`,
    payload
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

  interface TasksResponse {
    tasks: Task[];
  }

  const axiosInstance = await getAxiosInstance();
  
  // Get all tasks including subtasks
  const query = new URLSearchParams({
    subtasks: 'true',
    include_closed: 'true',
    order_by: 'created',
    reverse: 'true'
  }).toString();

  const response = await axiosInstance.get<TasksResponse>(
    `/list/${targetListId}/task?${query}`
  );

  // Create a map of tasks by ID for quick lookup and track subtasks
  const tasksById = new Map<string, Task>();
  const subtaskIds = new Set<string>();

  // First pass: Initialize all tasks
  for (const task of response.data.tasks) {
    tasksById.set(task.id, { ...task, subtasks: [] });
    if (task.parent?.id) {
      subtaskIds.add(task.id);
    }
  }

  // Second pass: Build task hierarchy
  for (const task of response.data.tasks) {
    if (task.parent?.id) {
      const parentTask = tasksById.get(task.parent.id);
      if (parentTask) {
        parentTask.subtasks = parentTask.subtasks || [];
        parentTask.subtasks.push(tasksById.get(task.id)!);
      }
    }
  }

  // Get root tasks (tasks that are not subtasks)
  const rootTasks = Array.from(tasksById.values()).filter(task => !subtaskIds.has(task.id));

  // Sort root tasks by creation date (newest first)
  rootTasks.sort((a, b) => {
    const aDate = new Date(a.date_created || 0);
    const bDate = new Date(b.date_created || 0);
    return bDate.getTime() - aDate.getTime();
  });

  return rootTasks;
}

export async function getTask(taskId: string): Promise<Task> {
  const axiosInstance = await getAxiosInstance();
  
  // Get task details including subtasks
  const query = new URLSearchParams({
    include_subtasks: 'true',
    custom_fields: 'true'
  }).toString();

  const response = await axiosInstance.get<Task>(
    `/task/${taskId}?${query}`
  );

  return response.data;
}

export async function updateTask(taskId: string, updates: UpdateTaskParams): Promise<Task> {
  const config = await getConfig();
  const { token } = config.clickup;

  // Ensure updates are sent in the correct format
  const requestBody = {
    ...updates,
    priority: updates.priority
  };

  const response = await axios.put<Task>(
    `${BASE_URL}/task/${taskId}`,
    requestBody,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    }
  );

  return response.data;
}

export async function deleteTask(taskId: string): Promise<void> {
  const axiosInstance = await getAxiosInstance();
  await axiosInstance.delete(`/task/${taskId}`);
}

export async function getListStatuses(listId: string): Promise<TaskStatus[]> {
  const config = await getConfig();
  const { token } = config.clickup;

  interface ListResponse {
    statuses: TaskStatus[];
  }

  const response = await axios.get<ListResponse>(
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
    const response = await api.get<{ teams: any[] }>('/team');
    return response.data.teams;
  });
}

export async function getSpaces(workspaceId: string): Promise<any[]> {
  const api = await getAxiosInstance();
  return makeRequest(async () => {
    const response = await api.get<{ spaces: any[] }>(`/team/${workspaceId}/space`);
    return response.data.spaces;
  });
}

export async function getLists(spaceId: string): Promise<any[]> {
  const api = await getAxiosInstance();
  return makeRequest(async () => {
    const response = await api.get<{ lists: any[] }>(`/space/${spaceId}/list`);
    return response.data.lists;
  });
}

export async function listSubtasks(taskId: string): Promise<Task[]> {
  const api = await getAxiosInstance();
  return makeRequest(async () => {
    const response = await api.get<{ tasks: Task[] }>(`/task/${taskId}/subtask`);
    return response.data.tasks;
  });
}

export async function createStatus(listId: string, status: string, color: string, orderindex?: number): Promise<TaskStatus> {
  const axiosInstance = await getAxiosInstance();
  
  const response = await axiosInstance.post<TaskStatus>(
    `/list/${listId}/status`,
    {
      status,
      color,
      orderindex
    }
  );

  return response.data;
}

export async function updateStatus(listId: string, oldStatus: string, newStatus: string, color?: string, orderindex?: number): Promise<TaskStatus> {
  const axiosInstance = await getAxiosInstance();
  
  const response = await axiosInstance.put<TaskStatus>(
    `/list/${listId}/status/${oldStatus}`,
    {
      status: newStatus,
      color,
      orderindex
    }
  );

  return response.data;
}

export async function deleteStatus(listId: string, status: string): Promise<void> {
  const axiosInstance = await getAxiosInstance();
  await axiosInstance.delete(`/list/${listId}/status/${status}`);
}

export async function getSpaceTags(spaceId: string): Promise<Tag[]> {
  const axiosInstance = await getAxiosInstance();
  const response = await axiosInstance.get<{ tags: Tag[] }>(`/space/${spaceId}/tag`);
  return response.data.tags;
}

export async function createTag(spaceId: string, name: string, tagBg: string = '#000000', tagFg: string = '#ffffff'): Promise<Tag> {
  const axiosInstance = await getAxiosInstance();
  const response = await axiosInstance.post<Tag>(`/space/${spaceId}/tag`, {
    name,
    tag_bg: tagBg,
    tag_fg: tagFg
  });
  return response.data;
}

export async function deleteTag(spaceId: string, name: string): Promise<void> {
  const axiosInstance = await getAxiosInstance();
  await axiosInstance.delete(`/space/${spaceId}/tag/${name}`);
}

export async function updateTaskTags(taskId: string, tags: string[]): Promise<Task> {
  const axiosInstance = await getAxiosInstance();
  const response = await axiosInstance.put<Task>(`/task/${taskId}`, {
    tags
  });
  return response.data;
}
