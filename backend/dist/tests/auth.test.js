"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const auth_1 = require("../lib/auth");
(0, globals_1.describe)('Authentication Utilities', () => {
    const testPassword = 'testpassword123';
    let hashedPassword;
    let testToken;
    (0, globals_1.beforeAll)(async () => {
        hashedPassword = await (0, auth_1.hashPassword)(testPassword);
    });
    (0, globals_1.describe)('Password Hashing', () => {
        (0, globals_1.it)('should hash password successfully', async () => {
            (0, globals_1.expect)(hashedPassword).toBeDefined();
            (0, globals_1.expect)(hashedPassword).not.toBe(testPassword);
            (0, globals_1.expect)(hashedPassword.length).toBeGreaterThan(0);
        });
        (0, globals_1.it)('should verify correct password', async () => {
            const isValid = await (0, auth_1.comparePassword)(testPassword, hashedPassword);
            (0, globals_1.expect)(isValid).toBe(true);
        });
        (0, globals_1.it)('should reject incorrect password', async () => {
            const isValid = await (0, auth_1.comparePassword)('wrongpassword', hashedPassword);
            (0, globals_1.expect)(isValid).toBe(false);
        });
    });
    (0, globals_1.describe)('JWT Token', () => {
        const payload = {
            userId: 'test-user-id',
            email: 'test@example.com',
            role: 'USER'
        };
        (0, globals_1.beforeAll)(() => {
            testToken = (0, auth_1.generateToken)(payload);
        });
        (0, globals_1.it)('should generate token successfully', () => {
            (0, globals_1.expect)(testToken).toBeDefined();
            (0, globals_1.expect)(typeof testToken).toBe('string');
            (0, globals_1.expect)(testToken.length).toBeGreaterThan(0);
        });
        (0, globals_1.it)('should verify token successfully', () => {
            const decoded = (0, auth_1.verifyToken)(testToken);
            (0, globals_1.expect)(decoded.userId).toBe(payload.userId);
            (0, globals_1.expect)(decoded.email).toBe(payload.email);
            (0, globals_1.expect)(decoded.role).toBe(payload.role);
        });
    });
});
//# sourceMappingURL=auth.test.js.map