import { ClickUpClient } from './index.js';

export interface Task {
  id: string;
  name: string;
  description?: string;
  status?: {
    status: string;
    color: string;
  };
  date_created?: string;
  date_updated?: string;
  date_closed?: string;
  creator?: {
    id: number;
    username: string;
    email: string;
  };
  assignees?: Array<{
    id: number;
    username: string;
    email: string;
  }>;
  priority?: {
    id: string;
    priority: string;
    color: string;
  };
  due_date?: string | null;
  start_date?: string | null;
  time_estimate?: number | null;
  time_spent?: number | null;
  custom_fields?: Array<any>;
  list?: {
    id: string;
    name: string;
  };
  folder?: {
    id: string;
    name: string;
  };
  space?: {
    id: string;
    name: string;
  };
  url: string;
  subtasks?: Task[]; // Add subtasks property
  parent?: string; // Add parent property
  top_level_parent?: string; // Add top_level_parent property
}

export interface CreateTaskParams {
  name: string;
  description?: string;
  assignees?: number[];
  tags?: string[];
  status?: string;
  priority?: number;
  due_date?: number;
  due_date_time?: boolean;
  time_estimate?: number;
  start_date?: number;
  start_date_time?: boolean;
  notify_all?: boolean;
  parent?: string;
  links_to?: string;
  check_required_custom_fields?: boolean;
  custom_fields?: Array<{
    id: string;
    value: any;
  }>;
}

export interface UpdateTaskParams {
  name?: string;
  description?: string;
  assignees?: number[];
  status?: string;
  priority?: number;
  due_date?: number;
  due_date_time?: boolean;
  time_estimate?: number;
  start_date?: number;
  start_date_time?: boolean;
  notify_all?: boolean;
  parent?: string;
  custom_fields?: Array<{
    id: string;
    value: any;
  }>;
}

export interface GetTasksParams {
  page?: number;
  order_by?: string;
  reverse?: boolean;
  subtasks?: boolean;
  statuses?: string[];
  include_closed?: boolean;
  assignees?: number[];
  due_date_gt?: number;
  due_date_lt?: number;
  date_created_gt?: number;
  date_created_lt?: number;
  date_updated_gt?: number;
  date_updated_lt?: number;
  date_closed_gt?: number;
  date_closed_lt?: number;
  custom_fields?: Array<{
    field_id: string;
    operator: string;
    value: any;
  }>;
  tags?: string[];
  priority?: number[];
  space_ids?: string[];
  project_ids?: string[];
  list_ids?: string[];
}

export class TasksClient {
  private client: ClickUpClient;

  constructor(client: ClickUpClient) {
    this.client = client;
  }

  /**
   * Get tasks from a specific list
   * @param listId The ID of the list to get tasks from
   * @param params Optional parameters for filtering tasks
   * @returns A list of tasks
   */
  async getTasksFromList(listId: string, params?: GetTasksParams): Promise<{ tasks: Task[] }> {
    return this.client.get(`/list/${listId}/task`, params);
  }

  /**
   * Get tasks from a team/workspace with filtering
   * @param teamId The ID of the team to get tasks from
   * @param params Optional parameters for filtering tasks
   * @returns A list of tasks
   */
  async getTasksFromTeam(teamId: string, params?: GetTasksParams): Promise<{ tasks: Task[] }> {
    return this.client.get(`/team/${teamId}/task`, params);
  }

  /**
   * Get all tasks from a folder by aggregating tasks from all lists in the folder
   * @param folderId The ID of the folder to get tasks from
   * @param params Optional parameters for filtering tasks
   * @returns A list of tasks from all lists in the folder
   */
  async getTasksFromFolder(folderId: string, params?: GetTasksParams): Promise<{ tasks: Task[] }> {
    try {
      // Get all lists from the folder
      const listsResponse = await this.client.get(`/folder/${folderId}/list`);
      const allTasks: Task[] = [];
      
      if (listsResponse.lists) {
        for (const list of listsResponse.lists) {
          // Skip this list if list_ids filter is specified and this list is not included
          if (params?.list_ids && !params.list_ids.includes(list.id)) {
            continue;
          }
          
          try {
            const listTasks = await this.getTasksFromList(list.id, params);
            allTasks.push(...listTasks.tasks);
          } catch (error) {
            console.warn(`Failed to get tasks from list ${list.id} in folder ${folderId}:`, error);
          }
        }
      }
      
      return { tasks: allTasks };
    } catch (error) {
      console.error(`Error getting tasks from folder ${folderId}:`, error);
      throw error;
    }
  }

  /**
   * Get all tasks from a space by aggregating tasks from all lists and folders
   * @param spaceId The ID of the space to get tasks from
   * @param params Optional parameters for filtering tasks
   * @returns A list of tasks from all lists in the space
   */
  async getTasksFromSpace(spaceId: string, params?: GetTasksParams): Promise<{ tasks: Task[] }> {
    try {
      // Get all folders and folderless lists from the space
      const foldersResponse = await this.client.get(`/space/${spaceId}/folder`);
      const folderlessListsResponse = await this.client.get(`/space/${spaceId}/list`);
      
      const allTasks: Task[] = [];
      
      // Get tasks from folderless lists
      if (folderlessListsResponse.lists) {
        for (const list of folderlessListsResponse.lists) {
          // Skip this list if list_ids filter is specified and this list is not included
          if (params?.list_ids && !params.list_ids.includes(list.id)) {
            continue;
          }
          
          try {
            const listTasks = await this.getTasksFromList(list.id, params);
            allTasks.push(...listTasks.tasks);
          } catch (error) {
            console.warn(`Failed to get tasks from list ${list.id}:`, error);
          }
        }
      }
      
      // Get tasks from folders (which contain lists)
      if (foldersResponse.folders) {
        for (const folder of foldersResponse.folders) {
          if (folder.lists) {
            for (const list of folder.lists) {
              // Skip this list if list_ids filter is specified and this list is not included
              if (params?.list_ids && !params.list_ids.includes(list.id)) {
                continue;
              }
              
              try {
                const listTasks = await this.getTasksFromList(list.id, params);
                allTasks.push(...listTasks.tasks);
              } catch (error) {
                console.warn(`Failed to get tasks from list ${list.id} in folder ${folder.id}:`, error);
              }
            }
          }
        }
      }
      
      return { tasks: allTasks };
    } catch (error) {
      console.error(`Error getting tasks from space ${spaceId}:`, error);
      throw error;
    }
  }

  // Removed pseudo endpoints for getting tasks from spaces and folders

  /**
   * Get a specific task by ID
   * @param taskId The ID of the task to get
   * @param params Optional parameters (include_subtasks)
   * @returns The task details
   */
  async getTask(taskId: string, params?: { include_subtasks?: boolean }): Promise<Task> {
    return this.client.get(`/task/${taskId}`, params);
  }

  /**
   * Create a new task in a list
   * @param listId The ID of the list to create the task in
   * @param params The task parameters
   * @returns The created task
   */
  async createTask(listId: string, params: CreateTaskParams): Promise<Task> {
    return this.client.post(`/list/${listId}/task`, params);
  }

  /**
   * Update an existing task
   * @param taskId The ID of the task to update
   * @param params The task parameters to update
   * @returns The updated task
   */
  async updateTask(taskId: string, params: UpdateTaskParams): Promise<Task> {
    return this.client.put(`/task/${taskId}`, params);
  }

  /**
   * Delete a task
   * @param taskId The ID of the task to delete
   * @returns Success message
   */
  async deleteTask(taskId: string): Promise<{ success: boolean }> {
    return this.client.delete(`/task/${taskId}`);
  }

  /**
   * Get subtasks of a specific task
   * @param taskId The ID of the task to get subtasks for
   * @returns A list of subtasks
   */
  async getSubtasks(taskId: string): Promise<Task[]> {
    try {
      // First, we need to get the task to find its list ID
      const task = await this.getTask(taskId);
      if (!task.list || !task.list.id) {
        throw new Error('Task does not have a list ID');
      }
      
      // Then, get all tasks from the list with subtasks included
      const result = await this.getTasksFromList(task.list.id, { subtasks: true });
      
      // Filter tasks to find those that have the specified task as parent
      return result.tasks.filter(task => task.parent === taskId);
    } catch (error) {
      console.error(`Error getting subtasks for task ${taskId}:`, error);
      return [];
    }
  }
}

export const createTasksClient = (client: ClickUpClient): TasksClient => {
  return new TasksClient(client);
};
