import { Config, Task } from '../src/types/clickup.js';
import { createTask, createSubtask, listTasks } from '../src/services/clickup.js';
import { getConfig } from '../src/config/store.js';
import axios from 'axios';

jest.mock('../src/config/store.js');
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

type MockResponse<T> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: {
    url: string;
    method: string;
    [key: string]: unknown;
  };
}

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
      name: 'Test Task 1',
      description: 'Description 1',
      status: {
        status: 'open',
        color: '#000000',
        type: 'custom'
      },
      priority: {
        id: '1',
        priority: 'urgent',
        color: '#f50000',
        orderindex: '1'
      },
      url: 'https://app.clickup.com/123/v/li/1',
      tags: [],
      list: {
        id: '123'
      },
      space: {
        id: 'space123',
        name: 'Test Space',
        private: false
      },
      subtasks: []
    }
  ];

  let mockAxiosInstance: jest.Mocked<typeof axios>;

  beforeEach(() => {
    jest.clearAllMocks();
    (getConfig as jest.Mock).mockResolvedValue(mockConfig);

    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      create: jest.fn(),
      request: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() }
      },
      defaults: {},
      getUri: jest.fn(),
      head: jest.fn(),
      options: jest.fn(),
      isAxiosError: jest.fn(),
      Cancel: jest.fn(),
      CancelToken: jest.fn(),
      all: jest.fn(),
      spread: jest.fn(),
      Axios: jest.fn(),
      AxiosError: jest.fn(),
      VERSION: '',
      toJSON: jest.fn(),
      from: jest.fn(),
      allSettled: jest.fn(),
      httpAgent: {} as unknown,
      httpsAgent: {} as unknown,
      proxy: {} as unknown,
      cancelToken: {} as unknown,
      env: {} as unknown,
      adapter: {} as unknown,
      transformRequest: [] as unknown[],
      transformResponse: [] as unknown[],
      xsrfCookieName: '',
      xsrfHeaderName: '',
      validateStatus: jest.fn(),
      transitional: {} as unknown,
      maxRedirects: 0,
      timeout: 0
    } as unknown as jest.Mocked<typeof axios>;

    mockedAxios.create.mockReturnValue(mockAxiosInstance);
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockTasks[0],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          url: '/list/list123/task',
          method: 'POST'
        }
      } as MockResponse<Task>);

      const result = await createTask('list123', 'Test Task', 'Test Description', 1, 'to do');
      expect(result).toEqual(mockTasks[0]);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/list/list123/task', {
        name: 'Test Task',
        description: 'Test Description',
        priority: 1,
        status: 'to do'
      });
    });
  });

  describe('createSubtask', () => {
    it('should create a subtask with the given parameters', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockTasks[0],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          url: '/list/test-list-id/task',
          method: 'POST'
        }
      } as MockResponse<Task>);

      const result = await createSubtask('1', 'Test Subtask', 'Test Description', 3, 'open');
      expect(result).toEqual(mockTasks[0]);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/list/test-list-id/task', {
        name: 'Test Subtask',
        description: 'Test Description',
        parent: '1',
        priority: 3,
        status: 'open'
      });
    });
  });

  describe('listTasks', () => {
    it('should list all tasks in a list', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { tasks: mockTasks },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          url: '/list/test-list-id/task',
          method: 'GET'
        }
      } as MockResponse<{ tasks: Task[] }>);

      const result = await listTasks('test-list-id');
      expect(result).toEqual(mockTasks);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/list/test-list-id/task?subtasks=true&include_closed=true&order_by=created&reverse=true&include_subtasks=true');
    });
  });
});
