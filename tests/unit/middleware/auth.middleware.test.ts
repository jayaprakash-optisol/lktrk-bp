import { Response, NextFunction } from 'express';
import { mockRequest, mockResponse } from '../../mocks';
import { authenticate, authorize } from '../../../src/middleware/auth.middleware';
import { jwtUtil } from '../../../src/utils/jwt.util';
import { setupBasicTests } from '../../mocks/test-hooks';
import { AppError } from '../../../src/utils/response.util';

// Setup test hooks
setupBasicTests();

// Mock JWT utility
jest.mock('../../../src/utils/jwt.util', () => ({
  jwtUtil: {
    verifyToken: jest.fn(),
  },
}));

// Mock AppError
jest.mock('../../../src/utils/response.util', () => {
  return {
    AppError: class MockAppError extends Error {
      statusCode: number;
      constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
      }
    },
  };
});

describe('Auth Middleware', () => {
  describe('authenticate', () => {
    it('should set user on request when valid token provided', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      req.headers = {
        authorization: 'Bearer valid_token',
      };

      // Mock token verification
      (jwtUtil.verifyToken as jest.Mock).mockReturnValue({
        success: true,
        data: {
          userId: '9f983688-16f7-4969-9eb9-72eb7acbefa2',
          email: 'test@example.com',
          roleId: 'role-123',
        },
      });

      // Act
      authenticate(req, res as Response, next as NextFunction);

      // Assert
      expect(jwtUtil.verifyToken).toHaveBeenCalledWith('valid_token');
      expect(req.user).toEqual({
        id: '9f983688-16f7-4969-9eb9-72eb7acbefa2',
        email: 'test@example.com',
        roleId: 'role-123',
      });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next with error when no token provided', () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      req.headers = {}; // No authorization header

      // Act
      authenticate(req, res as Response, next as NextFunction);

      // Assert
      expect(jwtUtil.verifyToken).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
      expect(next.mock.calls[0][0].message).toContain('token');
    });

    it('should call next with error when invalid token format provided', () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      req.headers = {
        authorization: 'InvalidFormat', // Missing "Bearer "
      };

      // Act
      authenticate(req, res as Response, next as NextFunction);

      // Assert
      expect(jwtUtil.verifyToken).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });

    it('should call next with error when token verification fails', () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      req.headers = {
        authorization: 'Bearer invalid_token',
      };

      // Mock token verification failure
      (jwtUtil.verifyToken as jest.Mock).mockReturnValue({
        success: false,
        data: null,
        error: 'Invalid token',
      });

      // Act
      authenticate(req, res as Response, next as NextFunction);

      // Assert
      expect(jwtUtil.verifyToken).toHaveBeenCalledWith('invalid_token');
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });
  });

  describe('authorize', () => {
    it('should call next with error when user does not have required role', () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      req.user = {
        id: '1',
        userId: 1,
        email: 'test@example.com',
        roleId: 'role-123',
      };

      const middleware = authorize('admin');

      // Act
      middleware(req, res as Response, next as NextFunction);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
    });

    it('should call next with error when no user is attached to request', () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      // No user on request
      req.user = undefined;

      const middleware = authorize('admin');

      // Act
      middleware(req, res as Response, next as NextFunction);

      // Assert
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });
  });
});
