import bcrypt from 'bcrypt';
import { eq, getTableColumns } from 'drizzle-orm';
import { db } from '../config/database.config';
import { user } from '../models';
import { NewUser, User, ServiceResponse, PaginationParams, PaginatedResult } from '../types';
import { IUserService } from '../types/interfaces/user.interface';
import env from '../config/env.config';
import { StatusCodes } from 'http-status-codes';
import { createServiceResponse, createNotFoundError } from '../utils/response.util';
import { v4 as uuidv4 } from 'uuid';

interface ErrorWithStatusCode extends Error {
  statusCode: number;
}

export class UserService implements IUserService {
  private static instance: UserService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Create a new user
   */
  async createUser(
    userData: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ServiceResponse<User>> {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(
        userData.password,
        parseInt(env.BCRYPT_SALT_ROUNDS.toString(), 10),
      );

      const now = new Date();

      // Insert user into database with hashed password
      const result = await db
        .insert(user)
        .values({
          id: uuidv4(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: hashedPassword,
          phoneNumber: userData.phoneNumber,
          roleId: userData.roleId,
          createdAt: now,
          updatedAt: now,
          isDeleted: false,
        })
        .returning();

      if (!result.length) {
        throw new Error('Failed to create user');
      }

      return createServiceResponse(true, result[0], undefined, StatusCodes.CREATED);
    } catch (error) {
      return createServiceResponse<User>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.BAD_REQUEST,
      );
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<ServiceResponse<User>> {
    try {
      const result = await db.select().from(user).where(eq(user.id, userId)).limit(1);

      if (!result.length) {
        throw createNotFoundError(`User with ID ${userId} not found`);
      }

      return createServiceResponse(true, result[0]);
    } catch (error) {
      const statusCode =
        error instanceof Error && 'statusCode' in error
          ? (error as ErrorWithStatusCode).statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      return createServiceResponse<User>(false, undefined, (error as Error).message, statusCode);
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<ServiceResponse<User>> {
    try {
      const result = await db.select().from(user).where(eq(user.email, email)).limit(1);

      if (!result.length) {
        throw createNotFoundError(`User with email ${email} not found`);
      }

      return createServiceResponse(true, result[0]);
    } catch (error) {
      const statusCode =
        error instanceof Error && 'statusCode' in error
          ? (error as ErrorWithStatusCode).statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      return createServiceResponse<User>(false, undefined, (error as Error).message, statusCode);
    }
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers(
    pagination: PaginationParams,
  ): Promise<ServiceResponse<PaginatedResult<Omit<User, 'password'>>>> {
    try {
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await db.select({ count: user.id }).from(user);
      const total = countResult.length;

      // Get users with pagination
      const { password: _password, ...rest } = getTableColumns(user);
      const result = await db.select(rest).from(user).limit(limit).offset(offset);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);

      const paginatedResult: PaginatedResult<Omit<User, 'password'>> = {
        items: result,
        total,
        page,
        limit,
        totalPages,
      };

      return createServiceResponse(true, paginatedResult);
    } catch (error) {
      return createServiceResponse<PaginatedResult<Omit<User, 'password'>>>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    userData: Partial<Omit<User, 'id' | 'email' | 'createdAt' | 'updatedAt'>>,
  ): Promise<ServiceResponse<User>> {
    try {
      // Check if user exists
      const existingUser = await db.select().from(user).where(eq(user.id, userId)).limit(1);

      if (!existingUser.length) {
        throw createNotFoundError(`User with ID ${userId} not found`);
      }

      // If password is being updated, hash it
      let dataToUpdate = { ...userData };
      if (userData.password) {
        const hashedPassword = await bcrypt.hash(
          userData.password,
          parseInt(env.BCRYPT_SALT_ROUNDS.toString(), 10),
        );
        dataToUpdate = { ...dataToUpdate, password: hashedPassword };
      }

      // Update user
      const result = await db
        .update(user)
        .set({ ...dataToUpdate, updatedAt: new Date() })
        .where(eq(user.id, userId))
        .returning();

      return createServiceResponse(true, result[0]);
    } catch (error) {
      const statusCode =
        error instanceof Error && 'statusCode' in error
          ? (error as ErrorWithStatusCode).statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      return createServiceResponse<User>(false, undefined, (error as Error).message, statusCode);
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<ServiceResponse<void>> {
    try {
      // Check if user exists
      const existingUser = await db.select().from(user).where(eq(user.id, userId)).limit(1);

      if (!existingUser.length) {
        throw createNotFoundError(`User with ID ${userId} not found`);
      }

      // Delete user
      await db.delete(user).where(eq(user.id, userId));

      return createServiceResponse<void>(true, undefined, undefined, StatusCodes.NO_CONTENT);
    } catch (error) {
      const statusCode =
        error instanceof Error && 'statusCode' in error
          ? (error as ErrorWithStatusCode).statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      return createServiceResponse<void>(false, undefined, (error as Error).message, statusCode);
    }
  }

  /**
   * Verify user password
   */
  async verifyPassword(email: string, password: string): Promise<ServiceResponse<User>> {
    try {
      // Get user by email
      const userResult = await this.getUserByEmail(email);

      if (!userResult.success || !userResult.data) {
        return createServiceResponse<User>(
          false,
          undefined,
          'Invalid credentials',
          StatusCodes.UNAUTHORIZED,
        );
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, userResult.data.password);

      if (!isPasswordValid) {
        return createServiceResponse<User>(
          false,
          undefined,
          'Invalid credentials',
          StatusCodes.UNAUTHORIZED,
        );
      }

      return createServiceResponse<User>(true, userResult.data);
    } catch (error) {
      return createServiceResponse<User>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
