import { Request, Response, NextFunction } from 'express';
import { IUserService } from '../types/interfaces';
import { sendSuccess, sendError } from '../utils/response.util';
import { UserService } from '../services/user.service';

export class UserController {
  private readonly userService: IUserService;

  constructor() {
    this.userService = UserService.getInstance();
  }

  /**
   * Get all users with pagination
   */
  getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      if (page < 1 || limit < 1) {
        return sendError(res, 'Page and limit must be positive integers');
      }

      const result = await this.userService.getAllUsers({ page, limit });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to retrieve users');
      }

      sendSuccess(res, result.data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user by ID
   */
  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.id;

      if (!userId) {
        return sendError(res, 'Invalid user ID');
      }

      const result = await this.userService.getUserById(userId);

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to retrieve user');
      }

      sendSuccess(res, result.data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user
   */
  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.id;

      if (!userId) {
        return sendError(res, 'Invalid user ID');
      }

      const { firstName, lastName, password, roleId, isActive } = req.body;

      const result = await this.userService.updateUser(userId, {
        firstName,
        lastName,
        password,
        roleId,
      });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to update user');
      }

      sendSuccess(res, result.data, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete user
   */
  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.id;

      if (!userId) {
        return sendError(res, 'Invalid user ID');
      }

      const result = await this.userService.deleteUser(userId);

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to delete user');
      }

      sendSuccess(res, undefined, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
