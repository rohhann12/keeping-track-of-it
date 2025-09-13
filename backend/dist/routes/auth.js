"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../lib/auth");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Sign up
router.post('/signup', async (req, res) => {
    try {
        const { email, password, role = 'USER' } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        // Check if user already exists
        const existinguser = await prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (existinguser) {
            return res.status(400).json({ error: 'user already exists' });
        }
        // Hash password
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        // Create user
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role.toUpperCase()
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
        res.status(201).json({
            message: 'user created successfully',
            user,
            token
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Sign in
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        // Find user
        const user = await prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Verify password
        const isValidPassword = await (0, auth_1.comparePassword)(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate token
        const token = (0, auth_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role
        });
        res.json({
            message: 'Sign in successful',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            },
            token
        });
    }
    catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get current user
router.get('/me', auth_2.authenticate, (req, res) => {
    res.json({
        user: req.user
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map