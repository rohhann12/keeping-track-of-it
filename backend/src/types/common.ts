export interface CreateProjectData {
  title: string;
  description?: string;
  userId: string;
}

export interface UpdateProjectData {
  title?: string;
  description?: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  completed?: boolean;
  projectId: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface ProjectResponse {
  id: string;
  title: string;
  description: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  tasks: TaskResponse[];
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface AccessContext {
  userId: string;
  role: UserRole;
  isAdmin: boolean;
}
