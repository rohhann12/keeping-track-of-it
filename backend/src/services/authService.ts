import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword, generateToken } from '../lib/auth';
import { AuthResponse, SigninData, SignupData } from '../types/auth';


export class AuthService {
  async signup(data: SignupData): Promise<AuthResponse> {
    const { email, password, role } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "USER"
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
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      message: 'User created successfully',
      user,
      token
    };
  }

  async signin(data: SigninData): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      message: 'Sign in successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token
    };
  }
}
