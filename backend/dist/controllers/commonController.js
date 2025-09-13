"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonController = void 0;
const commonService_1 = require("../services/commonService");
const cache_1 = require("../middleware/cache");
class CommonController {
    commonService;
    constructor() {
        this.commonService = new commonService_1.CommonService();
    }
    createAccessContext(req) {
        return {
            userId: req.user.userId,
            role: req.user.role,
            isAdmin: req.user.role === 'ADMIN'
        };
    }
    // Project operations
    async getUserProjects(req, res) {
        try {
            const context = this.createAccessContext(req);
            const targetUserId = req.params.userId; // For admin accessing specific user's projects
            const projects = await this.commonService.getUserProjects(context, targetUserId ?? undefined);
            res.json({
                projects,
                count: projects.length
            });
        }
        catch (error) {
            console.error('Get projects error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async getAllProjects(req, res) {
        try {
            const projects = await this.commonService.getAllProjects();
            res.json({
                projects,
                count: projects.length
            });
        }
        catch (error) {
            console.error('Get all projects error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async getProjectById(req, res) {
        try {
            const { id } = req.params;
            const context = this.createAccessContext(req);
            const targetUserId = req.params.userId; // For admin accessing specific user's project
            const project = await this.commonService.getProjectById(id, context, targetUserId ?? undefined);
            res.json({ project });
        }
        catch (error) {
            console.error('Get project error:', error);
            if (error instanceof Error && error.message === 'Project not found') {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
    async createProject(req, res) {
        try {
            const { title, description } = req.body;
            const context = this.createAccessContext(req);
            const userId = context.userId;
            if (!title) {
                res.status(400).json({ error: 'Title is required' });
                return;
            }
            const project = await this.commonService.createProject({
                title,
                description,
                userId
            }, context);
            // Invalidate cache
            await (0, cache_1.invalidateCache)('projects:*');
            await (0, cache_1.invalidateCache)('admin:projects:*');
            res.status(201).json({
                message: 'Project created successfully',
                project
            });
        }
        catch (error) {
            console.error('Create project error:', error);
            if (error instanceof Error && error.message === 'User not found') {
                res.status(400).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
    async updateProject(req, res) {
        try {
            const { id } = req.params;
            const { title, description } = req.body;
            const context = this.createAccessContext(req);
            const targetUserId = req.params.userId; // For admin updating specific user's project
            const updatedProject = await this.commonService.updateProject(id, { title, description }, context, targetUserId ?? undefined);
            // Invalidate cache
            await (0, cache_1.invalidateCache)('projects:*');
            await (0, cache_1.invalidateCache)('admin:projects:*');
            res.json({
                message: 'Project updated successfully',
                project: updatedProject
            });
        }
        catch (error) {
            console.error('Update project error:', error);
            if (error instanceof Error && error.message === 'Project not found') {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
    async deleteProject(req, res) {
        try {
            const { id } = req.params;
            const context = this.createAccessContext(req);
            const targetUserId = req.params.userId; // For admin deleting specific user's project
            await this.commonService.deleteProject(id, context, targetUserId ?? undefined);
            // Invalidate cache
            await (0, cache_1.invalidateCache)('projects:*');
            await (0, cache_1.invalidateCache)('admin:projects:*');
            res.json({
                message: 'Project deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete project error:', error);
            if (error instanceof Error && error.message === 'Project not found') {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
    // Task operations
    async getProjectTasks(req, res) {
        try {
            const { projectId } = req.params;
            const context = this.createAccessContext(req);
            const targetUserId = req.params.userId; // For admin accessing specific user's project tasks
            const tasks = await this.commonService.getProjectTasks(projectId, context, targetUserId ?? undefined);
            res.json({
                tasks,
                count: tasks.length
            });
        }
        catch (error) {
            console.error('Get tasks error:', error);
            if (error instanceof Error && error.message === 'Project not found') {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
    async getTaskById(req, res) {
        try {
            const { projectId, taskId } = req.params;
            const context = this.createAccessContext(req);
            const targetUserId = req.params.userId; // For admin accessing specific user's task
            const task = await this.commonService.getTaskById(projectId, taskId, context, targetUserId ?? undefined);
            res.json({ task });
        }
        catch (error) {
            console.error('Get task error:', error);
            if (error instanceof Error) {
                if (error.message === 'Project not found' || error.message === 'Task not found') {
                    res.status(404).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: 'Internal server error' });
                }
            }
            else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
    async createTask(req, res) {
        try {
            const { projectId } = req.params;
            const { title, description, completed = false } = req.body;
            const context = this.createAccessContext(req);
            const targetUserId = req.params.userId; // For admin creating task in specific user's project
            if (!title) {
                res.status(400).json({ error: 'Title is required' });
                return;
            }
            const task = await this.commonService.createTask({
                title,
                description,
                completed,
                projectId: projectId
            }, context, targetUserId ?? undefined);
            // Invalidate cache
            await (0, cache_1.invalidateCache)('projects:*');
            await (0, cache_1.invalidateCache)('admin:projects:*');
            res.status(201).json({
                message: 'Task created successfully',
                task
            });
        }
        catch (error) {
            console.error('Create task error:', error);
            if (error instanceof Error && error.message === 'Project not found') {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
    async updateTask(req, res) {
        try {
            const { projectId, taskId } = req.params;
            const { title, description, completed } = req.body;
            const context = this.createAccessContext(req);
            const targetUserId = req.params.userId; // For admin updating specific user's task
            const updatedTask = await this.commonService.updateTask(projectId, taskId, {
                title,
                description,
                completed
            }, context, targetUserId ?? undefined);
            // Invalidate cache
            await (0, cache_1.invalidateCache)('projects:*');
            await (0, cache_1.invalidateCache)('admin:projects:*');
            res.json({
                message: 'Task updated successfully',
                task: updatedTask
            });
        }
        catch (error) {
            console.error('Update task error:', error);
            if (error instanceof Error && error.message === 'Task not found') {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
    async deleteTask(req, res) {
        try {
            const { projectId, taskId } = req.params;
            const context = this.createAccessContext(req);
            const targetUserId = req.params.userId; // For admin deleting specific user's task
            await this.commonService.deleteTask(projectId, taskId, context, targetUserId ?? undefined);
            // Invalidate cache
            await (0, cache_1.invalidateCache)('projects:*');
            await (0, cache_1.invalidateCache)('admin:projects:*');
            res.json({
                message: 'Task deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete task error:', error);
            if (error instanceof Error && error.message === 'Task not found') {
                res.status(404).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
    // Admin-specific operations
    async getUserProjectTasks(req, res) {
        try {
            const { userId, projectId } = req.params;
            const context = this.createAccessContext(req);
            // Verify the user exists
            const user = await this.commonService.getUserById(userId);
            // Get the project and verify it belongs to the user
            const project = await this.commonService.getProjectById(projectId, context, userId);
            // Get all tasks for this project
            const tasks = await this.commonService.getProjectTasks(projectId, context, userId);
            res.json({
                user,
                project,
                tasks,
                count: tasks.length
            });
        }
        catch (error) {
            console.error('Get user project tasks error:', error);
            if (error instanceof Error) {
                if (error.message === 'User not found' || error.message === 'Project not found') {
                    res.status(404).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: 'Internal server error' });
                }
            }
            else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
}
exports.CommonController = CommonController;
//# sourceMappingURL=commonController.js.map