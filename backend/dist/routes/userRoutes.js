"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const cache_1 = require("../middleware/cache");
const kafka_1 = require("../lib/kafka");
const router = (0, express_1.Router)();
// Apply authentication to all routes
router.use(auth_1.authenticate);
router.use(auth_1.requireUser);
// Get all projects for the authenticated user
router.get('/projects', (0, cache_1.cacheMiddleware)('projects', 60), async (req, res) => {
    try {
        const projects = await prisma_1.prisma.project.findMany({
            where: {
                userId: req.user.userId
            },
            include: {
                tasks: true,
                user: {
                    select: {
                        id: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({
            projects,
            count: projects.length
        });
    }
    catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get a specific project
router.get('/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma_1.prisma.project.findFirst({
            where: {
                id,
                userId: req.user.userId
            },
            include: {
                tasks: true,
                user: {
                    select: {
                        id: true,
                        email: true
                    }
                }
            }
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json({ project });
    }
    catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get tasks for a specific project
router.get('/projects/:projectId/tasks', async (req, res) => {
    try {
        const { projectId } = req.params;
        // Verify project belongs to user
        const project = await prisma_1.prisma.project.findFirst({
            where: {
                id: projectId,
                userId: req.user.userId
            }
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const tasks = await prisma_1.prisma.task.findMany({
            where: {
                projectId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({
            tasks,
            count: tasks.length
        });
    }
    catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get a specific task
router.get('/projects/:projectId/tasks/:taskId', async (req, res) => {
    try {
        const { projectId, taskId } = req.params;
        // Verify project belongs to user
        const project = await prisma_1.prisma.project.findFirst({
            where: {
                id: projectId,
                userId: req.user.userId
            }
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const task = await prisma_1.prisma.task.findFirst({
            where: {
                id: taskId,
                projectId
            }
        });
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ task });
    }
    catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create a new project
router.post('/projects', async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user?.userId;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        // Verify user exists
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(400).json({ error: 'user not found' });
        }
        const project = await prisma_1.prisma.project.create({
            // @ts-ignore
            data: {
                title,
                description,
                userId
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
        await (0, kafka_1.publishEvent)('project.created', {
            projectId: project.id,
            title: project.title,
            userId: project.userId,
            timestamp: new Date().toISOString()
        });
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
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update a project
router.put('/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        const project = await prisma_1.prisma.project.findUnique({
            where: { id }
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const updatedProject = await prisma_1.prisma.project.update({
            where: { id },
            data: {
                title: title || project.title,
                description: description !== undefined ? description : project.description
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
        await (0, kafka_1.publishEvent)('project.updated', {
            projectId: updatedProject.id,
            title: updatedProject.title,
            userId: updatedProject.userId,
            timestamp: new Date().toISOString()
        });
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
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete a project
router.delete('/projects/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma_1.prisma.project.findUnique({
            where: { id }
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        await prisma_1.prisma.project.delete({
            where: { id }
        });
        // Publish event
        await (0, kafka_1.publishEvent)('project.deleted', {
            projectId: project.id,
            title: project.title,
            userId: project.userId,
            timestamp: new Date().toISOString()
        });
        // Invalidate cache
        await (0, cache_1.invalidateCache)('projects:*');
        await (0, cache_1.invalidateCache)('admin:projects:*');
        res.json({
            message: 'Project deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get tasks for a project
router.get('/projects/:projectId/tasks', async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await prisma_1.prisma.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const tasks = await prisma_1.prisma.task.findMany({
            where: {
                projectId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({
            tasks,
            count: tasks.length
        });
    }
    catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create a new task
router.post('/projects/:projectId/tasks', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, description, completed = false } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        const project = await prisma_1.prisma.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const task = await prisma_1.prisma.task.create({
            // @ts-ignore
            data: {
                title,
                description,
                completed,
                projectId
            }
        });
        // Publish event
        await (0, kafka_1.publishEvent)('task.created', {
            taskId: task.id,
            title: task.title,
            projectId: task.projectId,
            timestamp: new Date().toISOString()
        });
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
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update a task
router.put('/projects/:projectId/tasks/:taskId', async (req, res) => {
    try {
        const { projectId, taskId } = req.params;
        const { title, description, completed } = req.body;
        const task = await prisma_1.prisma.task.findFirst({
            where: {
                id: taskId,
                projectId
            }
        });
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        const updatedTask = await prisma_1.prisma.task.update({
            where: { id: taskId },
            data: {
                title: title || task.title,
                description: description !== undefined ? description : task.description,
                completed: completed !== undefined ? completed : task.completed
            }
        });
        // Publish event
        await (0, kafka_1.publishEvent)('task.updated', {
            taskId: updatedTask.id,
            title: updatedTask.title,
            projectId: updatedTask.projectId,
            completed: updatedTask.completed,
            timestamp: new Date().toISOString()
        });
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
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete a task
router.delete('/projects/:projectId/tasks/:taskId', async (req, res) => {
    try {
        const { projectId, taskId } = req.params;
        const task = await prisma_1.prisma.task.findFirst({
            where: {
                id: taskId,
                projectId
            }
        });
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        await prisma_1.prisma.task.delete({
            where: { id: taskId }
        });
        // Publish event
        await (0, kafka_1.publishEvent)('task.deleted', {
            taskId: task.id,
            title: task.title,
            projectId: task.projectId,
            timestamp: new Date().toISOString()
        });
        // Invalidate cache
        await (0, cache_1.invalidateCache)('projects:*');
        await (0, cache_1.invalidateCache)('admin:projects:*');
        res.json({
            message: 'Task deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=userRoutes.js.map