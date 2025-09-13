"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const commonController_1 = require("../controllers/commonController");
const auth_1 = require("../middleware/auth");
const cache_1 = require("../middleware/cache");
const router = (0, express_1.Router)();
const commonController = new commonController_1.CommonController();
// Apply authentication to all routes
router.use(auth_1.authenticate);
router.use(auth_1.requireUser);
// Get all projects for the authenticated user
router.get('/projects', (0, cache_1.cacheMiddleware)('projects', 60), (req, res) => commonController.getUserProjects(req, res));
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
exports.default = router;
//# sourceMappingURL=userRoutes.js.map