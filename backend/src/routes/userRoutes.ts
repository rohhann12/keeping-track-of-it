import { Router } from 'express';
import { CommonController } from '../controllers/commonController';
import { authenticate, requireUser } from '../middleware/auth';
import { cacheMiddleware } from '../middleware/cache';

const router = Router();
const commonController = new CommonController();

// Apply authentication to all routes
router.use(authenticate);
router.use(requireUser);

// Get all projects for the authenticated user
router.get('/projects', cacheMiddleware('projects', 60), (req, res) => commonController.getUserProjects(req, res));

// Get a specific project
router.get('/projects/:id', (req, res) => commonController.getProjectById(req, res));

// Get tasks for a specific project
router.get('/projects/:projectId/tasks', (req, res) => commonController.getProjectTasks(req, res));

// Get a specific task
router.get('/projects/:projectId/tasks/:taskId', (req, res) => commonController.getTaskById(req, res));

// Create a new project
router.post('/projects', (req, res) => commonController.createProject(req, res));

// Update a project
router.put('/projects/:id', (req, res) => commonController.updateProject(req, res));

// Delete a project
router.delete('/projects/:id', (req, res) => commonController.deleteProject(req, res));

// Create a new task
router.post('/projects/:projectId/tasks', (req, res) => commonController.createTask(req, res));

// Update a task
router.put('/projects/:projectId/tasks/:taskId', (req, res) => commonController.updateTask(req, res));

// Delete a task
router.delete('/projects/:projectId/tasks/:taskId', (req, res) => commonController.deleteTask(req, res));

export default router;