import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { cacheMiddleware } from '../middleware/cache';

const router = Router();

// Apply authentication and admin role to all routes
router.use(authenticate);
router.use(requireAdmin);

// Get all projects (admin can see all)
router.get('/projects', cacheMiddleware('admin:projects', 60), async (req: AuthenticatedRequest, res: Response) => {
  try {
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

    res.json({
      projects,
      count: projects.length
    });
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// get all projects of a specific user /:userId/projects

// get all tasks of a project of a user so like /:userId/projects/:projectId

// Get a specific project
router.get('/projects/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: req.user!.userId
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
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
