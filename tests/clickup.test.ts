import { Config, Task } from '../src/types/clickup.js';
import { createTask, createSubtask, listTasks, PRIORITY_MAP } from '../src/services/clickup.js';
import { getConfig } from '../src/config/store.js';
import axios from 'axios';

jest.mock('../src/config/store.js');
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

interface MockResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: Record<string, unknown>;
}

const createMockResponse = <T>(data: T): MockResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {}
});

describe('ClickUp Service', () => {
  const mockConfig: Config = {
    clickup: {
      token: 'test-token',
      defaultList: 'test-list-id'
    }
  };

  const mockTasks: Task[] = [
    {
      id: '1',
      name: 'Task 1',
      description: 'Description 1',
      status: { status: 'in progress', type: 'custom' },
      list: { id: '123' },
      priority: { id: '1', priority: 'urgent', color: '#ff0000', orderindex: '1' },
      url: 'https://app.clickup.com/123/v/li/1',
      space: { id: '456', name: 'Test Space', private: false },
      tags: [],
      subtasks: []
    },
    {
      id: '2',
      name: 'Task 2',
      description: 'Description 2',
      status: { status: 'done', type: 'custom' },
      list: { id: '123' },
      priority: { id: '2', priority: 'high', color: '#ffcc00', orderindex: '2' },
      url: 'https://app.clickup.com/123/v/li/2',
      space: { id: '456', name: 'Test Space', private: false },
      tags: [],
      subtasks: []
    }
  ];

  const mockParentTask: Task = {
    id: '1',
    name: 'Parent Task',
    description: 'Parent Description',
    status: { status: 'in progress', type: 'custom' },
    list: { id: '123' },
    priority: { id: '1', priority: 'urgent', color: '#ff0000', orderindex: '1' },
    url: 'https://app.clickup.com/123/v/li/1',
    space: { id: '456', name: 'Test Space', private: false },
    tags: [],
    subtasks: []
  };

  beforeEach((): void => {
    (getConfig as jest.Mock).mockResolvedValue(mockConfig);
    jest.clearAllMocks();
  });

  afterEach((): void => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task successfully', async (): Promise<void> => {
      const mockTask = {
        id: '123',
        name: 'Test Task',
        description: 'Test Description',
        status: { status: 'to do', type: 'custom', color: '#000000' },
        priority: { id: '1', priority: 'urgent', color: '#f50000', orderindex: '1' },
        url: 'https://app.clickup.com/123',
        list: { id: 'list123' },
        space: { id: 'space123', name: 'Test Space', private: false }
      };

      const mockAxiosInstance = {
        get: jest.fn(),
        post: jest.fn().mockResolvedValueOnce(createMockResponse(mockTask)),
        defaults: {
          headers: {
            common: { 'Accept': 'application/json' }
          }
        }
      };

      mockedAxios.create.mockReturnValue(mockAxiosInstance as unknown as typeof axios);

      const result = await createTask('list123', 'Test Task', 'Test Description', 1, 'to do');
      expect(result).toEqual(mockTask);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/list/list123/task',
        {
          name: 'Test Task',
          description: 'Test Description',
          priority: 1,
          status: 'to do'
        }
      );
    });
  });

  describe('createSubtask', () => {
    it('should create a subtask with the given parameters', async (): Promise<void> => {
      const mockAxiosInstance = {
        get: jest.fn(),
        post: jest.fn(),
        defaults: {
          headers: {
            common: { 'Accept': 'application/json' }
          }
        }
      };

      mockedAxios.create.mockReturnValue(mockAxiosInstance as unknown as typeof axios);
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse(mockParentTask));
      mockAxiosInstance.post.mockResolvedValueOnce(createMockResponse({ data: mockTasks[0] }));

      const result = await createSubtask('1', 'Test Subtask', 'Test Description', 3);
      expect(result).toEqual(mockTasks[0]);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/task/1?include_subtasks=true&custom_fields=true');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/list/123/task', {
        name: 'Test Subtask',
        description: 'Test Description',
        priority: PRIORITY_MAP[3],
        parent: '1',
        status: undefined
      });
    });
  });

  describe('listTasks', () => {
    it('should list all tasks in a list', async (): Promise<void> => {
      const mockAxiosInstance = {
        get: jest.fn(),
        post: jest.fn(),
        defaults: {
          headers: {
            common: { 'Accept': 'application/json' }
          }
        }
      };

      mockedAxios.create.mockReturnValue(mockAxiosInstance as unknown as typeof axios);
      mockAxiosInstance.get.mockResolvedValueOnce(createMockResponse({ tasks: mockTasks }));

      const result = await listTasks('test-list-id');
      expect(result).toEqual(mockTasks);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/list/test-list-id/task?subtasks=true&include_closed=true&order_by=created&reverse=true');
    });
  });
});
