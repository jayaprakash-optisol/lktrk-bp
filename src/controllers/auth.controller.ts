import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response.util';
import { authService } from '../services';

export class AuthController {
  /**
   * Register a new user
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, firstName, lastName, roleId } = req.body;

      // Validate required fields
      if (!email || !password) {
        return sendError(res, 'Email and password are required');
      }

      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
        roleId,
      });

      if (!result.success) {
        return sendError(res, result.error ?? 'Registration failed');
      }

      sendSuccess(res, result.data, 'User registered successfully', result.statusCode);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login user
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return sendError(res, 'Email and password are required');
      }

      const result = await authService.login(email, password);

      if (!result.success) {
        return sendError(res, result.error ?? 'Login failed', 401);
      }

      sendSuccess(res, result.data, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get current user
   */
  getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return sendError(res, 'User not authenticated');
      }

      sendSuccess(res, {
        userId: req.user.userId,
        email: req.user.email,
        role: req.user.role,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refresh token
   */
  refreshToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return sendError(res, 'User not authenticated');
      }

      const result = await authService.refreshToken(req.user.id.toString());

      if (!result.success) {
        return sendError(res, result.error ?? 'Token refresh failed');
      }

      sendSuccess(res, result.data, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  };
}
