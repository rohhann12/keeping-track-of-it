import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare class CommonController {
    private commonService;
    constructor();
    private createAccessContext;
    getUserProjects(req: AuthenticatedRequest, res: Response): Promise<void>;
    getAllProjects(req: AuthenticatedRequest, res: Response): Promise<void>;
    getProjectById(req: AuthenticatedRequest, res: Response): Promise<void>;
    createProject(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateProject(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteProject(req: AuthenticatedRequest, res: Response): Promise<void>;
    getProjectTasks(req: AuthenticatedRequest, res: Response): Promise<void>;
    getTaskById(req: AuthenticatedRequest, res: Response): Promise<void>;
    createTask(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateTask(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteTask(req: AuthenticatedRequest, res: Response): Promise<void>;
    getUserProjectTasks(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=commonController.d.ts.map