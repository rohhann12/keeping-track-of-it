import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { hashPassword, generateToken } from '../lib/auth';

const router = Router();
const authController = new AuthController();

// Sign up
router.post('/signup', (req, res) => authController.signup(req, res));

// Sign in
router.post('/signin', (req, res) => authController.signin(req, res));

// Create admin (only for superadmin) SHOVING ITS LOGIC HERE FOR QUICK UNDERSTANDING
router.post('/create-admin', authenticate, async (req: any, res) => {
  try {
    // Check if the requesting user is a superadmin
    // FOR NOW LEAVING IT 
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken({
      userId: admin.id,
      email: admin.email,
      role: admin.role
    });

    res.status(201).json({
      message: 'Admin created successfully',
      user: admin,
      token
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;