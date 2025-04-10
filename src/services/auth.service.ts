import { StatusCodes } from 'http-status-codes';
import { JwtPayload, NewUser, ServiceResponse, User, IAuthService, IUserService } from '../types';
import { createServiceResponse } from '../utils/response.util';
import { jwtUtil } from '../utils/jwt.util';
import { UserService } from './user.service';
import { Singleton } from '../utils/service.util';
import { db } from '../config/database.config';
import { eq } from 'drizzle-orm';
import { role } from '../models';

@Singleton
export class AuthService implements IAuthService {
  private readonly userService: IUserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Register a new user
   */
  async register(
    userData: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ServiceResponse<Omit<User, 'password'>>> {
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

      // Create new user
      const result = await this.userService.createUser(userData);
      const { password: _password, ...userWithoutPassword } = result.data!;
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
      const token = await this.generateToken(verifyResult.data);

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
  private async generateToken(user: User): Promise<string> {
    // Get the role name from the role id
    const roleResult = await db.select().from(role).where(eq(role.id, user.roleId)).limit(1);

    const roleName = roleResult.length ? roleResult[0].name : user.roleId;

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: roleName,
    };

    return jwtUtil.generateToken(payload);
  }

  /**
   * Refresh token
   */
  async refreshToken(userId: string): Promise<ServiceResponse<{ token: string }>> {
    try {
      const userResult = await this.userService.getUserById(userId);

      if (!userResult.success || !userResult.data) {
        return createServiceResponse<{ token: string }>(
          false,
          undefined,
          'Invalid user',
          StatusCodes.UNAUTHORIZED,
        );
      }

      const token = await this.generateToken(userResult.data);
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
