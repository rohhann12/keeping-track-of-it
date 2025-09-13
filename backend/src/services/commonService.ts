import { prisma } from '../lib/prisma';
import { publishEvent } from '../lib/kafka';
import { 
  CreateProjectData, 
  UpdateProjectData, 
  CreateTaskData, 
  UpdateTaskData,
  ProjectResponse,
  TaskResponse,
  UserResponse,
  AccessContext
} from '../types/common';

export class CommonService {
  async getUserProjects(context: AccessContext, targetUserId?: string | undefined): Promise<ProjectResponse[]> {
    const userId = context.isAdmin && targetUserId ? targetUserId : context.userId;
    
    const projects = await prisma.project.findMany({
      where: {
        userId: userId
      },
      include: {
        tasks: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return projects;
  }

  async getAllProjects(): Promise<ProjectResponse[]> {
    const projects = await prisma.project.findMany({
      include: {
        tasks: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return projects;
  }

  async getProjectById(projectId: string, context: AccessContext, targetUserId?: string | undefined | undefined): Promise<ProjectResponse> {
    const userId = context.isAdmin && targetUserId ? targetUserId : context.userId;
    
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ...(context.isAdmin ? {} : { userId: userId })
      },
      include: {
        tasks: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  }

  async getProjectTasks(projectId: string, context: AccessContext, targetUserId?: string | undefined): Promise<TaskResponse[]> {
    const userId = context.isAdmin && targetUserId ? targetUserId : context.userId;
    
    // Verify project belongs to user (unless admin)
    if (!context.isAdmin) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: userId
        }
      });

      if (!project) {
        throw new Error('Project not found');
      }
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return tasks;
  }

  async getTaskById(projectId: string, taskId: string, context: AccessContext, targetUserId?: string | undefined): Promise<TaskResponse> {
    const userId = context.isAdmin && targetUserId ? targetUserId : context.userId;
    
    // Verify project belongs to user (unless admin)
    if (!context.isAdmin) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: userId
        }
      });

      if (!project) {
        throw new Error('Project not found');
      }
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId
      }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    return task;
  }

  async createProject(data: CreateProjectData, context: AccessContext): Promise<ProjectResponse> {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        userId: data.userId
      },
      include: {
        tasks: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Publish event
    await publishEvent('project.created', {
      projectId: project.id,
      title: project.title,
      userId: project.userId,
      timestamp: new Date().toISOString()
    });

    return project;
  }

  async updateProject(projectId: string, data: UpdateProjectData, context: AccessContext, targetUserId?: string | undefined): Promise<ProjectResponse> {
    const userId = context.isAdmin && targetUserId ? targetUserId : context.userId;
    
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ...(context.isAdmin ? {} : { userId: userId })
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        title: data.title || project.title,
        description: data.description !== undefined ? data.description : project.description
      },
      include: {
        tasks: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Publish event
    await publishEvent('project.updated', {
      projectId: updatedProject.id,
      title: updatedProject.title,
      userId: updatedProject.userId,
      timestamp: new Date().toISOString()
    });

    return updatedProject;
  }

  async deleteProject(projectId: string, context: AccessContext, targetUserId?: string | undefined): Promise<void> {
    const userId = context.isAdmin && targetUserId ? targetUserId : context.userId;
    
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ...(context.isAdmin ? {} : { userId: userId })
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    await prisma.project.delete({
      where: { id: projectId }
    });

    // Publish event
    await publishEvent('project.deleted', {
      projectId: project.id,
      title: project.title,
      userId: project.userId,
      timestamp: new Date().toISOString()
    });
  }

  async createTask(data: CreateTaskData, context: AccessContext, targetUserId?: string | undefined): Promise<TaskResponse> {
    const userId = context.isAdmin && targetUserId ? targetUserId : context.userId;
    
    const project = await prisma.project.findFirst({
      where: {
        id: data.projectId,
        ...(context.isAdmin ? {} : { userId: userId })
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        completed: data.completed || false,
        projectId: data.projectId
      }
    });

    // Publish event
    await publishEvent('task.created', {
      taskId: task.id,
      title: task.title,
      projectId: task.projectId,
      timestamp: new Date().toISOString()
    });

    return task;
  }

  async updateTask(projectId: string, taskId: string, data: UpdateTaskData, context: AccessContext, targetUserId?: string | undefined): Promise<TaskResponse> {
    const userId = context.isAdmin && targetUserId ? targetUserId : context.userId;
    
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId
      }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title || task.title,
        description: data.description !== undefined ? data.description : task.description,
        completed: data.completed !== undefined ? data.completed : task.completed
      }
    });

    // Publish event
    await publishEvent('task.updated', {
      taskId: updatedTask.id,
      title: updatedTask.title,
      projectId: updatedTask.projectId,
      completed: updatedTask.completed,
      timestamp: new Date().toISOString()
    });

    return updatedTask;
  }

  async deleteTask(projectId: string, taskId: string, context: AccessContext, targetUserId?: string | undefined): Promise<void> {
    const userId = context.isAdmin && targetUserId ? targetUserId : context.userId;
    
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId
      }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    // Publish event
    await publishEvent('task.deleted', {
      taskId: task.id,
      title: task.title,
      projectId: task.projectId,
      timestamp: new Date().toISOString()
    });
  }

  async getUserById(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, createdAt: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
