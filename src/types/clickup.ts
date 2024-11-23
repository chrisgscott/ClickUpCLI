export interface Config {
  clickup: {
    token: string;
    defaultWorkspace?: string;
    defaultSpace?: string;
    defaultList?: string;
  };
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  parent: string | null;
  list: {
    id: string;
  };
  space: {
    id: string;
    name: string;
    private: boolean;
  };
}

export interface Priority {
  priority: number;
  color: string;
}

export interface TaskStatus {
  status: string;
  color: string;
  type: string;
  orderindex: number;
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

export interface List {
  id: string;
  name: string;
  content: string;
  status: TaskStatus;
}
