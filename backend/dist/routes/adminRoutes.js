"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const commonController_1 = require("../controllers/commonController");
const auth_1 = require("../middleware/auth");
const cache_1 = require("../middleware/cache");
const router = (0, express_1.Router)();
const commonController = new commonController_1.CommonController();
// Apply authentication and admin role to all routes
router.use(auth_1.authenticate);
router.use(auth_1.requireAdmin);
// Get all projects (admin can see all)
router.get('/projects', (0, cache_1.cacheMiddleware)('admin:projects', 60), (req, res) => commonController.getAllProjects(req, res));
// Get all projects of a specific user
router.get('/:userId/projects', (0, cache_1.cacheMiddleware)('admin:user:projects', 60), (req, res) => commonController.getUserProjects(req, res));
// Get all tasks of a project for a specific user
router.get('/:userId/projects/:projectId', (req, res) => commonController.getUserProjectTasks(req, res));
// Get a specific project
router.get('/projects/:id', (req, res) => commonController.getProjectById(req, res));
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map