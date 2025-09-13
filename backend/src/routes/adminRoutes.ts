import { Router } from 'express';
import { CommonController } from '../controllers/commonController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { cacheMiddleware } from '../middleware/cache';

const router = Router();
const commonController = new CommonController();

// Apply authentication and admin role to all routes
router.use(authenticate);
router.use(requireAdmin);

// Get all projects (admin can see all)
router.get('/projects', cacheMiddleware('admin:projects', 60), (req, res) => commonController.getAllProjects(req, res));

// Get all projects of a specific user
router.get('/:userId/projects', cacheMiddleware('admin:user:projects', 60), (req, res) => commonController.getUserProjects(req, res));

// Get all tasks of a project for a specific user
router.get('/:userId/projects/:projectId', (req, res) => commonController.getUserProjectTasks(req, res));

// Get a specific project
router.get('/projects/:id', (req, res) => commonController.getProjectById(req, res));

export default router;