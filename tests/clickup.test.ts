import { getConfig } from '../src/config/store.js';
import { createTask, createSubtask, listTasks, getTask } from '../src/services/clickup.js';
import { Task } from '../src/types/clickup.js';
import axios from 'axios';

jest.mock('../src/config/store.js');
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const createMockResponse = <T>(data: T) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {
    url: 'https://api.clickup.com/api/v2/mock',
    method: 'post',
    headers: {}
  }
});

describe('ClickUp Service', () => {
  const mockConfig = {
    clickup: {
      token: 'test-token',
      defaultList: 'test-list-id'
    }
  };

  beforeEach(() => {
    (getConfig as jest.Mock).mockResolvedValue(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task with the given parameters', async () => {
      const mockTask: Task = {
        id: '123',
        name: 'Test Task',
        description: 'Test Description',
        status: { status: 'to do', color: '#000000', type: 'custom', orderindex: 0 },
        priority: { priority: 3, color: '#000000' },
        parent: null,
        list: { id: 'test-list-id' },
        space: { id: 'test-space-id', name: 'Test Space', private: false }
      };

      mockedAxios.post.mockResolvedValueOnce(createMockResponse(mockTask));

      const taskName = 'Test Task';
      const taskDescription = 'Test Description';
      const taskPriority = 3;

      const createdTask = await createTask(taskName, taskDescription, taskPriority);
      expect(createdTask).toEqual(mockTask);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/list/test-list-id/task'),
        expect.objectContaining({
          name: taskName,
          description: taskDescription,
          priority: taskPriority
        }),
        expect.any(Object)
      );
    });
  });

  describe('createSubtask', () => {
    it('should create a subtask with the given parameters', async () => {
      const mockSubtask: Task = {
        id: '456',
        name: 'Test Subtask',
        description: 'Test Subtask Description',
        status: { status: 'to do', color: '#000000', type: 'custom', orderindex: 0 },
        priority: { priority: 3, color: '#000000' },
        parent: '123',
        list: { id: 'test-list-id' },
        space: { id: 'test-space-id', name: 'Test Space', private: false }
      };

      mockedAxios.post.mockResolvedValueOnce(createMockResponse(mockSubtask));

      const parentId = '123';
      const subtaskName = 'Test Subtask';
      const subtaskDescription = 'Test Subtask Description';
      const subtaskPriority = 3;

      const createdSubtask = await createSubtask(
        parentId,
        subtaskName,
        subtaskDescription,
        subtaskPriority
      );
      expect(createdSubtask).toEqual(mockSubtask);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining(`/task/${parentId}/subtask`),
        expect.objectContaining({
          name: subtaskName,
          description: subtaskDescription,
          priority: subtaskPriority
        }),
        expect.any(Object)
      );
    });
  });

  describe('listTasks', () => {
    it('should list all tasks in a list', async () => {
      const mockTasks: Task[] = [
        {
          id: '123',
          name: 'Test Task 1',
          description: 'Test Description 1',
          status: { status: 'to do', color: '#000000', type: 'custom', orderindex: 0 },
          priority: { priority: 3, color: '#000000' },
          parent: null,
          list: { id: 'test-list-id' },
          space: { id: 'test-space-id', name: 'Test Space', private: false }
        },
        {
          id: '456',
          name: 'Test Task 2',
          description: 'Test Description 2',
          status: { status: 'in progress', color: '#000000', type: 'custom', orderindex: 1 },
          priority: { priority: 3, color: '#000000' },
          parent: null,
          list: { id: 'test-list-id' },
          space: { id: 'test-space-id', name: 'Test Space', private: false }
        }
      ];

      mockedAxios.get.mockResolvedValueOnce(createMockResponse({ tasks: mockTasks }));

      const tasks = await listTasks();
      expect(tasks).toEqual(mockTasks);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/list/test-list-id/task'),
        expect.any(Object)
      );
    });
  });
});
