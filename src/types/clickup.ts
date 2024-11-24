export interface Config {
  clickup: {
    token: string;
    defaultWorkspace?: string;
    defaultSpace?: string;
    defaultList?: string;
  };
}

export interface TaskStatus {
  status: string;
  type: string;
  color?: string;
  orderindex?: number;
}

export interface Priority {
  id: string;
  priority: string;
  color: string;
  orderindex: string;
}

export interface Tag {
  name: string;
  tag_fg: string;
  tag_bg: string;
  creator?: {
    id: number;
    username: string;
    color: string;
    email: string;
    profilePicture: string;
  };
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  url: string;
  tags: Tag[];
  parent?: {
    id: string;
  };
  subtasks?: Task[];
  list: {
    id: string;
  };
  space: {
    id: string;
    name: string;
    private: boolean;
  };
  date_created?: string;
}

export interface UpdateTaskParams {
  name?: string;
  description?: string;
  priority?: number;
  status?: string;
  tags?: string[];
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
}

export interface Space {
  id: string;
  name: string;
  private: boolean;
}
