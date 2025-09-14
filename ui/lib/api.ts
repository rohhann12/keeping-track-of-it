import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
  user?: User;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsResponse {
  projects: Project[];
  count: number;
}

export interface TasksResponse {
  tasks: Task[];
  count: number;
}

class ApiClient {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token from localStorage
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Always check localStorage for fresh token
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = error.response?.data?.error || error.message || 'An error occurred';
        return Promise.reject(new Error(message));
      }
    );
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  // Authentication endpoints
  async signup(email: string, password: string, role?: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.axiosInstance.post('/api/auth/signup', {
      email,
      password,
      role
    });
    return response.data;
  }

  async signin(email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.axiosInstance.post('/api/auth/signin', {
      email,
      password
    });
    return response.data;
  }

  // Project endpoints (GET request on mount)
  async getProjects(): Promise<ProjectsResponse> {
    const response: AxiosResponse<ProjectsResponse> = await this.axiosInstance.get('/api/user/projects');
    return response.data;
  }

  async getProjectById(id: string): Promise<{ project: Project }> {
    const response: AxiosResponse<{ project: Project }> = await this.axiosInstance.get(`/api/user/projects/${id}`);
    return response.data;
  }

  // Create new project
  async createProject(title: string, description?: string): Promise<{ message: string; project: Project }> {
    const response: AxiosResponse<{ message: string; project: Project }> = await this.axiosInstance.post('/api/user/projects', {
      title,
      description
    });
    return response.data;
  }

  // Update project (PUT request for edit project)
  async updateProject(id: string, title: string, description?: string): Promise<{ message: string; project: Project }> {
    const response: AxiosResponse<{ message: string; project: Project }> = await this.axiosInstance.put(`/api/user/projects/${id}`, {
      title,
      description
    });
    return response.data;
  }

  async deleteProject(id: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.axiosInstance.delete(`/api/user/projects/${id}`);
    return response.data;
  }

  // Task endpoints
  async getProjectTasks(projectId: string): Promise<TasksResponse> {
    const response: AxiosResponse<TasksResponse> = await this.axiosInstance.get(`/api/user/projects/${projectId}/tasks`);
    return response.data;
  }

  async getTaskById(projectId: string, taskId: string): Promise<{ task: Task }> {
    const response: AxiosResponse<{ task: Task }> = await this.axiosInstance.get(`/api/user/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  }

  // Create new task
  async createTask(projectId: string, title: string, description?: string, completed = false): Promise<{ message: string; task: Task }> {
    const response: AxiosResponse<{ message: string; task: Task }> = await this.axiosInstance.post(`/api/user/projects/${projectId}/tasks`, {
      title,
      description,
      completed
    });
    return response.data;
  }

  // Update task (PUT request for edit task)
  async updateTask(projectId: string, taskId: string, title?: string, description?: string, completed?: boolean): Promise<{ message: string; task: Task }> {
    const response: AxiosResponse<{ message: string; task: Task }> = await this.axiosInstance.put(`/api/user/projects/${projectId}/tasks/${taskId}`, {
      title,
      description,
      completed
    });
    return response.data;
  }

  async deleteTask(projectId: string, taskId: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.axiosInstance.delete(`/api/user/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  }

  // Admin endpoints
  async getAllProjects(): Promise<ProjectsResponse> {
    const response: AxiosResponse<ProjectsResponse> = await this.axiosInstance.get('/api/admin/projects');
    return response.data;
  }

  async getUserProjects(userId: string): Promise<ProjectsResponse> {
    const response: AxiosResponse<ProjectsResponse> = await this.axiosInstance.get(`/api/admin/${userId}/projects`);
    return response.data;
  }

  async getUserProjectTasks(userId: string, projectId: string): Promise<{ user: User; project: Project; tasks: Task[]; count: number }> {
    const response: AxiosResponse<{ user: User; project: Project; tasks: Task[]; count: number }> = await this.axiosInstance.get(`/api/admin/${userId}/projects/${projectId}`);
    return response.data;
  }

  async getProjectByIdAdmin(id: string): Promise<{ project: Project }> {
    const response: AxiosResponse<{ project: Project }> = await this.axiosInstance.get(`/api/admin/projects/${id}`);
    return response.data;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
