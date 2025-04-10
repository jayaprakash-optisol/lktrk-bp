import { StatusCodes } from 'http-status-codes';
import { JwtPayload, NewUser, ServiceResponse, User } from '../types';
import { IAuthService } from '../types/interfaces';
import { IUserService } from '../types/interfaces';
import { createServiceResponse } from '../utils/response.util';
import { jwtUtil } from '../utils/jwt.util';
import { UserService } from './user.service';
import { RoleService, ModuleAccess } from './role.service';

export interface RegisterUserData extends Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'> {
  moduleAccess?: ModuleAccess[];
}

export class AuthService implements IAuthService {
  private readonly userService: IUserService;
  private readonly roleService: RoleService;
  private static instance: AuthService;

  private constructor() {
    this.userService = UserService.getInstance();
    this.roleService = RoleService.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterUserData): Promise<ServiceResponse<Omit<User, 'password'>>> {
    try {
      // Check if user already exists with the email
      const existingUserResult = await this.userService.getUserByEmail(userData.email);

      if (existingUserResult.success && existingUserResult.data) {
        return createServiceResponse<Omit<User, 'password'>>(
          false,
          undefined,
          'Email already in use',
          StatusCodes.BAD_REQUEST,
        );
      }

      // If moduleAccess is provided, create a custom role for this user
      let roleId: string | undefined = userData.roleId;

      if (userData.moduleAccess && userData.moduleAccess.length > 0) {
        // Create a new role with the provided module access
        const roleName = `${userData.firstName} ${userData.lastName} Role`;
        const roleResult = await this.roleService.createRole({
          name: roleName,
          description: `Custom role for ${userData.email}`,
          moduleAccess: userData.moduleAccess,
        });

        if (!roleResult.success || !roleResult.data) {
          return createServiceResponse<Omit<User, 'password'>>(
            false,
            undefined,
            'Failed to create role for user',
            StatusCodes.INTERNAL_SERVER_ERROR,
          );
        }

        // Use the newly created role ID
        roleId = roleResult.data.id;
      }

      // Make sure we have a roleId, either from input or newly created
      if (!roleId) {
        return createServiceResponse<Omit<User, 'password'>>(
          false,
          undefined,
          'Role ID is required',
          StatusCodes.BAD_REQUEST,
        );
      }

      // Validate that the roleId exists in the database
      if (userData.roleId) {
        const roleResult = await this.roleService.getRoleById(userData.roleId);
        if (!roleResult.success || !roleResult.data) {
          return createServiceResponse<Omit<User, 'password'>>(
            false,
            undefined,
            'Role not found',
            StatusCodes.NOT_FOUND,
          );
        }
      }

      // Create new user with the assigned role
      const { moduleAccess: _moduleAccess, ...userDataWithoutModuleAccess } = userData;
      const result = await this.userService.createUser({
        ...userDataWithoutModuleAccess,
        roleId,
      });

      if (!result.success || !result.data) {
        return createServiceResponse<Omit<User, 'password'>>(
          false,
          undefined,
          result.error || 'Failed to create user',
          StatusCodes.INTERNAL_SERVER_ERROR,
        );
      }

      const { password: _password, ...userWithoutPassword } = result.data;
      return createServiceResponse(true, userWithoutPassword, undefined, result.statusCode);
    } catch (error) {
      return createServiceResponse<Omit<User, 'password'>>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Login user
   */
  async login(
    email: string,
    password: string,
  ): Promise<ServiceResponse<{ user: User; token: string }>> {
    try {
      // Verify password
      const verifyResult = await this.userService.verifyPassword(email, password);

      if (!verifyResult.success || !verifyResult.data) {
        return createServiceResponse<{ user: User; token: string }>(
          false,
          undefined,
          'Invalid credentials',
          StatusCodes.UNAUTHORIZED,
        );
      }

      // Generate JWT token
      const token = this.generateToken(verifyResult.data);

      return createServiceResponse(true, {
        user: verifyResult.data,
        token,
      });
    } catch (error) {
      return createServiceResponse<{ user: User; token: string }>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
    };

    return jwtUtil.generateToken(payload);
  }

  /**
   * Refresh token
   */
  async refreshToken(userId: string): Promise<ServiceResponse<{ token: string }>> {
    try {
      // Get user by ID
      const userResult = await this.userService.getUserById(userId);

      if (!userResult.success || !userResult.data) {
        return createServiceResponse<{ token: string }>(
          false,
          undefined,
          'User not found',
          StatusCodes.NOT_FOUND,
        );
      }

      // Generate new token
      const token = this.generateToken(userResult.data);

      return createServiceResponse(true, { token });
    } catch (error) {
      return createServiceResponse<{ token: string }>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
