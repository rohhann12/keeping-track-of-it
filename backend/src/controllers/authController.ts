import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async signup(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, role } = req.body;

      if (role && role.toUpperCase() === 'ADMIN') {
        res.status(501).json({ error: 'Admin cant signup, Contact Administrator' });
        return;
      }

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await this.authService.signup({ email, password, role });
      res.status(201).json(result);
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof Error) {
        if (error.message === 'User already exists') {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Internal server error' });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async signin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await this.authService.signin({ email, password });
      res.json(result);
    } catch (error) {
      console.error('Signin error:', error);
      if (error instanceof Error) {
        if (error.message === 'Invalid credentials') {
          res.status(401).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Internal server error' });
        }
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
