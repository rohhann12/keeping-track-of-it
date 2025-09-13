import { CreateProjectData, UpdateProjectData, CreateTaskData, UpdateTaskData, ProjectResponse, TaskResponse, UserResponse, AccessContext } from '../types/common';
export declare class CommonService {
    getUserProjects(context: AccessContext, targetUserId?: string | undefined): Promise<ProjectResponse[]>;
    getAllProjects(): Promise<ProjectResponse[]>;
    getProjectById(projectId: string, context: AccessContext, targetUserId?: string | undefined | undefined): Promise<ProjectResponse>;
    getProjectTasks(projectId: string, context: AccessContext, targetUserId?: string | undefined): Promise<TaskResponse[]>;
    getTaskById(projectId: string, taskId: string, context: AccessContext, targetUserId?: string | undefined): Promise<TaskResponse>;
    createProject(data: CreateProjectData, context: AccessContext): Promise<ProjectResponse>;
    updateProject(projectId: string, data: UpdateProjectData, context: AccessContext, targetUserId?: string | undefined): Promise<ProjectResponse>;
    deleteProject(projectId: string, context: AccessContext, targetUserId?: string | undefined): Promise<void>;
    createTask(data: CreateTaskData, context: AccessContext, targetUserId?: string | undefined): Promise<TaskResponse>;
    updateTask(projectId: string, taskId: string, data: UpdateTaskData, context: AccessContext, targetUserId?: string | undefined): Promise<TaskResponse>;
    deleteTask(projectId: string, taskId: string, context: AccessContext, targetUserId?: string | undefined): Promise<void>;
    getUserById(userId: string): Promise<UserResponse>;
}
//# sourceMappingURL=commonService.d.ts.map