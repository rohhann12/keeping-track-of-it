"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
class AuthController {
    authService;
    constructor() {
        this.authService = new authService_1.AuthService();
    }
    async signup(req, res) {
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
        }
        catch (error) {
            console.error('Signup error:', error);
            if (error instanceof Error) {
                if (error.message === 'User already exists') {
                    res.status(400).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: 'Internal server error' });
                }
            }
            else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
    async signin(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ error: 'Email and password are required' });
                return;
            }
            const result = await this.authService.signin({ email, password });
            res.json(result);
        }
        catch (error) {
            console.error('Signin error:', error);
            if (error instanceof Error) {
                if (error.message === 'Invalid credentials') {
                    res.status(401).json({ error: error.message });
                }
                else {
                    res.status(500).json({ error: 'Internal server error' });
                }
            }
            else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map