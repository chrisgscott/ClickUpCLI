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
  description: string;
  priority: number;
  status: string;
  due_date?: number;
}

interface CreateTagData {
  name: string;
  tag_bg: string;
  tag_fg: string;
}

export async function createTask(
  listId: string,
  name: string,
  description: string,
  priority: number,
  status: string,
  dueDate?: string
): Promise<Task> {
  const axiosInstance = await getAxiosInstance();
  const taskData: CreateTaskData = {
    name,
    description,
    priority,
    status,
  };

  if (dueDate) {
    taskData.due_date = new Date(dueDate).getTime();
  }

  const response = await axiosInstance.post<Task>(`/list/${listId}/task`, taskData);
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
    priority: priority ? PRIORITY_MAP[priority] : undefined,
    status: status
  };

  const response = await axiosInstance.post<{ data: Task }>(
    `/list/${parentTask.list.id}/task`,
    payload
  );

  return response.data.data;
}

export async function listTasks(listId?: string): Promise<Task[]> {
  const config = await getConfig();
  const targetListId = listId || config.clickup.defaultList;

  if (!targetListId) {
    throw new Error('No list ID specified. Please set a default list or provide a list ID.');
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
  
  try {
    // Get task details including subtasks
    const query = new URLSearchParams({
      include_subtasks: 'true',
      custom_fields: 'true'
    }).toString();

    const response = await axiosInstance.get<Task>(
      `/task/${taskId}?${query}`
    );

    // Check if we got a valid response
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response from ClickUp API');
    }

    // Check if task has subtasks and fetch them
    if (response.data.subtasks) {
      const subtasks = await listSubtasks(taskId);
      response.data.subtasks = subtasks;
    }

    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number, data?: { message?: string } } };
      if (axiosError.response?.status === 404) {
        throw new Error(`Task with ID ${taskId} not found`);
      } else if (axiosError.response?.status === 401) {
        throw new Error('Unauthorized. Please check your ClickUp API token');
      }
    }
    // For all other errors, throw a generic error message
    throw error;
  }
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
