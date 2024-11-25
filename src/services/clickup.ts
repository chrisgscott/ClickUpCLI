import axios from 'axios';
import { Tag, Task, TaskStatus, UpdateTaskParams, Priority, Workspace, Space } from '../types/clickup.js';
import { getConfig } from '../config/store.js';

const BASE_URL = 'https://api.clickup.com/api/v2';

const getAxiosInstance = async (): Promise<ReturnType<typeof axios.create>> => {
  const config = await getConfig();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Authorization': config.clickup.token,
      'Content-Type': 'application/json'
    }
  });
};

// Priority mapping based on ClickUp's API
export const PRIORITY_MAP: { [key: number]: Priority } = {
  1: { id: "1", priority: "urgent", color: "#f50000", orderindex: "1" },
  2: { id: "2", priority: "high", color: "#ffcc00", orderindex: "2" },
  3: { id: "3", priority: "normal", color: "#6fddff", orderindex: "3" },
  4: { id: "4", priority: "low", color: "#d8d8d8", orderindex: "4" }
};

interface List {
  id: string;
  name: string;
  orderindex: number;
  content: string;
  status: {
    status: string;
    color: string;
    hide_label: boolean;
  };
  priority: {
    priority: string;
    color: string;
  };
  task_count: number;
  due_date: string;
  start_date: string;
  folder: {
    id: string;
    name: string;
    hidden: boolean;
    access: boolean;
  };
  space: {
    id: string;
    name: string;
    access: boolean;
  };
  archived: boolean;
  override_statuses: boolean;
  permission_level: string;
}

interface TasksResponse {
  tasks: Task[];
}

interface CreateTaskData {
  name: string;
  description?: string;
  priority?: number | null;
  status?: string;
  due_date?: number;
  parent?: string | null;
}

interface CreateTagData {
  name: string;
  tag_bg: string;
  tag_fg: string;
}

// Add a delay utility function
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Add retry logic utility
async function retry<T>(
  operation: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries === 0) throw error;
    await delay(delayMs);
    return retry(operation, retries - 1, delayMs);
  }
}

export async function createTask(
  listId: string,
  name: string,
  description: string,
  priority?: number,
  status?: string,
  dueDate?: string,
  parent?: string
): Promise<Task> {
  const axiosInstance = await getAxiosInstance();
  const taskData: CreateTaskData = {
    name,
    description,
    priority: priority || null,
    status: status || undefined
  };

  if (dueDate) {
    taskData.due_date = new Date(dueDate).getTime();
  }

  if (parent) {
    taskData.parent = parent;
  }

  console.log('Creating task with:', JSON.stringify(taskData, null, 2));
  console.log('List ID:', listId);

  const response = await axiosInstance.post<Task>(`/list/${listId}/task`, taskData);
  console.log('API Response:', JSON.stringify(response.data, null, 2));
  return response.data;
}

export async function createSubtask(
  parentId: string,
  name: string,
  description: string,
  priority?: number,
  status?: string
): Promise<Task> {
  const axiosInstance = await getAxiosInstance();
  const config = await getConfig();
  
  if (!config.clickup?.defaultList) {
    throw new Error('Default list not set. Please run "task config --interactive" first.');
  }

  const payload = {
    name,
    description,
    parent: parentId,
    priority: priority || undefined,
    status: status || undefined
  };

  // Add retry logic and delay for API consistency
  return retry(async () => {
    const response = await axiosInstance.post<Task>(
      `/list/${config.clickup.defaultList}/task`,
      payload
    );
    return response.data;
  });
}

export async function listTasks(listId?: string): Promise<Task[]> {
  const config = await getConfig();
  const targetListId = listId || config.clickup.defaultList;

  if (!targetListId) {
    throw new Error('No list ID specified. Please set a default list or provide a list ID.');
  }

  const axiosInstance = await getAxiosInstance();
  
  return retry(async (): Promise<Task[]> => {
    // Get all tasks including subtasks with expanded fields
    const query = new URLSearchParams({
      subtasks: 'true',
      include_closed: 'true',
      order_by: 'created',
      reverse: 'true',
      include_subtasks: 'true'
    }).toString();

    const response = await axiosInstance.get<TasksResponse>(
      `/list/${targetListId}/task?${query}`
    );

    // Create a map of tasks by ID for quick lookup
    const tasksById = new Map<string, Task>();

    // First pass: Initialize all tasks
    response.data.tasks.forEach(task => {
      tasksById.set(task.id, {
        ...task,
        subtasks: []
      });
    });

    // Second pass: Build task hierarchy
    response.data.tasks.forEach(task => {
      const parentId = typeof task.parent === 'string' ? task.parent : task.parent?.id;
      if (parentId) {
        const parentTask = tasksById.get(parentId);
        if (parentTask && parentTask.subtasks) {
          parentTask.subtasks.push(tasksById.get(task.id)!);
        }
      }
    });

    // Return only root tasks (tasks without parents)
    return Array.from(tasksById.values()).filter(task => !task.parent);
  });
}

export async function getTask(taskId: string): Promise<Task> {
  const axiosInstance = await getAxiosInstance();
  
  return retry(async () => {
    // Add query parameters to include subtasks
    const query = new URLSearchParams({
      include_subtasks: 'true',
      custom_fields: 'true'
    }).toString();

    const response = await axiosInstance.get<Task>(`/task/${taskId}?${query}`);
    return response.data;
  });
}

export async function updateTask(taskId: string, updates: UpdateTaskParams): Promise<Task> {
  const axiosInstance = await getAxiosInstance();
  
  const requestBody = {
    ...updates,
    priority: updates.priority
  };

  const response = await axiosInstance.put<Task>(
    `/task/${taskId}`,
    requestBody
  );

  return response.data;
}

export async function deleteTask(taskId: string): Promise<void> {
  const axiosInstance = await getAxiosInstance();
  await axiosInstance.delete(`/task/${taskId}`);
}

export async function getListStatuses(listId: string): Promise<TaskStatus[]> {
  const axiosInstance = await getAxiosInstance();
  const response = await axiosInstance.get<{ statuses: TaskStatus[] }>(`/list/${listId}`);
  return response.data.statuses;
}

export async function getWorkspaces(): Promise<Workspace[]> {
  const axiosInstance = await getAxiosInstance();
  const response = await axiosInstance.get<{ teams: Workspace[] }>('/team');
  return response.data.teams;
}

export async function getSpaces(workspaceId: string): Promise<Space[]> {
  const axiosInstance = await getAxiosInstance();
  const response = await axiosInstance.get<{ spaces: Space[] }>(`/team/${workspaceId}/space`);
  return response.data.spaces;
}

export async function getLists(spaceId: string): Promise<List[]> {
  const axiosInstance = await getAxiosInstance();
  const response = await axiosInstance.get<{ lists: List[] }>(`/space/${spaceId}/list`);
  return response.data.lists;
}

export async function listSubtasks(taskId: string): Promise<Task[]> {
  const axiosInstance = await getAxiosInstance();
  const response = await axiosInstance.get<{ data: { tasks: Task[] } }>(`/task/${taskId}/subtask`);
  return response.data.data.tasks;
}

export async function createStatus(listId: string, status: string, color: string, orderindex?: number): Promise<TaskStatus> {
  const axiosInstance = await getAxiosInstance();
  
  const payload = {
    status,
    color,
    orderindex: orderindex !== undefined ? orderindex.toString() : undefined
  };

  const response = await axiosInstance.post<TaskStatus>(
    `/list/${listId}/status`,
    payload
  );

  return response.data;
}

export async function updateStatus(listId: string, oldStatus: string, newStatus: string, color?: string, orderindex?: number): Promise<TaskStatus> {
  const axiosInstance = await getAxiosInstance();
  
  const encodedOldStatus = encodeURIComponent(oldStatus);
  const response = await axiosInstance.put<{ data: TaskStatus }>(
    `/list/${listId}/status/${encodedOldStatus}`,
    {
      status: newStatus,
      color,
      orderindex
    }
  );

  return response.data.data;
}

export async function deleteStatus(listId: string, status: string): Promise<void> {
  const axiosInstance = await getAxiosInstance();
  const encodedStatus = encodeURIComponent(status);
  await axiosInstance.delete(`/list/${listId}/status/${encodedStatus}`);
}

export async function getSpaceTags(spaceId: string): Promise<Tag[]> {
  const axiosInstance = await getAxiosInstance();
  const response = await axiosInstance.get<{ tags: Tag[] }>(`/space/${spaceId}/tag`);
  return response.data.tags;
}

export async function createTag(spaceId: string, name: string, tagBg: string = '#000000', tagFg: string = '#ffffff'): Promise<Tag> {
  const axiosInstance = await getAxiosInstance();
  const tagData: CreateTagData = {
    name,
    tag_bg: tagBg,
    tag_fg: tagFg
  };
  const response = await axiosInstance.post<{ tag: Tag }>(`/space/${spaceId}/tag`, { tag: tagData });
  return response.data.tag;
}

export async function deleteTag(spaceId: string, name: string): Promise<void> {
  const axiosInstance = await getAxiosInstance();
  await axiosInstance.delete(`/space/${spaceId}/tag/${name}`);
}

export async function updateTaskTags(taskId: string, tags: string[]): Promise<Task> {
  const axiosInstance = await getAxiosInstance();
  const response = await axiosInstance.put<{ data: Task }>(
    `/task/${taskId}`,
    { tags }
  );
  return response.data.data;
}

export async function manageStatus(
  listId: string,
  status: string,
  color: string,
  orderindex: number
): Promise<TaskStatus> {
  const axiosInstance = await getAxiosInstance();
  
  try {
    // First try to get existing statuses
    const existingStatuses = await getListStatuses(listId);
    const existingStatus = existingStatuses.find(s => s.status.toLowerCase() === status.toLowerCase());
    
    if (existingStatus) {
      // If status exists, update it
      const encodedStatus = encodeURIComponent(existingStatus.status);
      const response = await axiosInstance.put<{ data: TaskStatus }>(
        `/list/${listId}/status/${encodedStatus}`,
        {
          status,
          color,
          orderindex: orderindex.toString()
        }
      );
      return response.data.data;
    } else {
      // If status doesn't exist, create it
      const response = await axiosInstance.post<TaskStatus>(
        `/list/${listId}/status`,
        {
          status,
          color,
          orderindex: orderindex.toString()
        }
      );
      return response.data;
    }
  } catch (error: unknown) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    // Type guard for axios error response
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number, data?: { message?: string } } };
      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      }
    }
    throw new Error(`Failed to manage status ${status}: ${message}`);
  }
}
