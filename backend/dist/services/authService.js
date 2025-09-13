"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../lib/auth");
class AuthService {
    async signup(data) {
        const { email, password, role } = data;
        // Check if user already exists
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            throw new Error('User already exists');
        }
        // Hash password
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        // Create user
        const user = await prisma_1.prisma.user.create({
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
        const token = (0, auth_1.generateToken)({
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
    async signin(data) {
        const { email, password } = data;
        // Find user
        const user = await prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        // Verify password
        const isValidPassword = await (0, auth_1.comparePassword)(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }
        // Generate token
        const token = (0, auth_1.generateToken)({
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
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map