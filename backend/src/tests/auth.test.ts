import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { hashPassword, comparePassword, generateToken, verifyToken } from '../lib/auth';

describe('Authentication Utilities', () => {
  const testPassword = 'testpassword123';
  let hashedPassword: string;
  let testToken: string;

  beforeAll(async () => {
    hashedPassword = await hashPassword(testPassword);
  });

  describe('Password Hashing', () => {
    it('should hash password successfully', async () => {
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(testPassword);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it('should verify correct password', async () => {
      const isValid = await comparePassword(testPassword, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const isValid = await comparePassword('wrongpassword', hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Token', () => {
    const payload = {
      userId: 'test-user-id',
      email: 'test@example.com',
      role: 'USER' as const
    };

    beforeAll(() => {
      testToken = generateToken(payload);
    });

    it('should generate token successfully', () => {
      expect(testToken).toBeDefined();
      expect(typeof testToken).toBe('string');
      expect(testToken.length).toBeGreaterThan(0);
    });

    it('should verify token successfully', () => {
      const decoded = verifyToken(testToken);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });
  });
});
