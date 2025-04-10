import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { IAuthService } from '../types/interfaces';
import { sendSuccess, sendError } from '../utils/response.util';
import { AuthService } from '../services/auth.service';
import { moduleEnum, accessLevelEnum } from '../models/enums';

export class AuthController {
  private readonly authService: IAuthService;

  constructor() {
    this.authService = AuthService.getInstance();
  }

  /**
   * Register a new user
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, firstName, lastName, roleId, moduleAccess, phoneNumber } = req.body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        return sendError(res, 'Email, password, first name and last name are required');
      }

      // Process module access data from the request
      const processedModuleAccess = this.processModuleAccess(moduleAccess);
      console.log('processedModuleAccess', processedModuleAccess);

      // Register the user with role information
      const result = await this.authService.register({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        roleId: roleId,
        moduleAccess: processedModuleAccess,
      });

      if (!result.success) {
        return sendError(res, result.error ?? 'Registration failed', result.statusCode);
      }

      sendSuccess(res, result.data, 'User registered successfully', result.statusCode);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Process module access data from request
   * Transforms the checkbox-based UI format into the expected ModuleAccess array
   */
  private processModuleAccess(moduleAccessData: any) {
    if (!moduleAccessData || typeof moduleAccessData !== 'object') {
      return undefined;
    }

    const moduleAccessList = [];

    // Handle the format from UI checkboxes as shown in the image
    // Multiple access levels can be selected per module
    const availableModules = moduleEnum.enumValues;
    const accessLevels = accessLevelEnum.enumValues;

    for (const moduleName of Object.keys(moduleAccessData)) {
      // Validate that the module exists in our enum
      if (!availableModules.includes(moduleName as any)) {
        continue;
      }

      // Get the access level for this module
      const accessLevel = moduleAccessData[moduleName];
      if (!accessLevel || typeof accessLevel !== 'string') {
        continue;
      }

      // Validate that the access level exists in our enum
      if (!accessLevels.includes(accessLevel as any)) {
        continue;
      }

      // Add to our list with the determined access level
      moduleAccessList.push({
        module: moduleName as (typeof moduleEnum.enumValues)[number],
        accessLevel: accessLevel as (typeof accessLevelEnum.enumValues)[number],
      });
    }

    return moduleAccessList.length > 0 ? moduleAccessList : undefined;
  }

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

      const result = await this.authService.login(email, password);

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

      // Make sure we pass userId as a string
      const userId =
        typeof req.user.userId === 'string' ? req.user.userId : String(req.user.userId);
      const result = await this.authService.refreshToken(userId);

      if (!result.success) {
        return sendError(res, result.error ?? 'Token refresh failed');
      }

      sendSuccess(res, result.data, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  };
}
