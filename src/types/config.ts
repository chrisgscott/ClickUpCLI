export interface BulkConfig {
  tags?: TagConfig[];
  statuses?: StatusConfig[];
  templates?: Record<string, TaskTemplate>;
  tasks?: TaskConfig[];
}

export interface TagConfig {
  name: string;
  bg_color: string;
  fg_color: string;
}

export interface StatusConfig {
  name: string;
  color: string;
  order: number;
}

export interface TaskTemplate {
  name: string;
  description?: string;
  tags?: string[];
  status?: string;
  priority?: string;
  variables?: string[];
}

export interface TaskConfig {
  name: string;
  description?: string;
  priority: number;
  status: string;
  tags?: string[];
  due_date?: string;
  assignees?: string[];
  subtasks?: TaskConfig[];
}

export interface ValidationError {
  type: 'tag' | 'status' | 'template' | 'task' | 'config';
  item: string;
  message: string;
}

export interface ConfigDiff {
  tags: {
    added: TagConfig[];
    removed: TagConfig[];
    modified: Array<{
      old: TagConfig;
      new: TagConfig;
    }>;
  };
  statuses: {
    added: StatusConfig[];
    removed: StatusConfig[];
    modified: Array<{
      old: StatusConfig;
      new: StatusConfig;
    }>;
  };
  templates?: {
    added: string[];
    modified: string[];
    removed: string[];
  };
}
