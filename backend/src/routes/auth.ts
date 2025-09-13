import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Sign up
router.post('/signup', (req, res) => authController.signup(req, res));

// Sign in
router.post('/signin', (req, res) => authController.signin(req, res));


export default router;