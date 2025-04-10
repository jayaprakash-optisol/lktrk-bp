import { User, NewUser, ServiceResponse, PaginationParams, PaginatedResult } from '../index';

/**
 * User service interface
 */
export interface IUserService {
  /**
   * Create a new user
   */
  createUser(
    userData: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ServiceResponse<User>>;

  /**
   * Get user by ID
   */
  getUserById(userId: string): Promise<ServiceResponse<User>>;

  /**
   * Get user by email
   */
  getUserByEmail(email: string): Promise<ServiceResponse<User>>;

  /**
   * Get all users with pagination
   */
  getAllUsers(
    pagination: PaginationParams,
  ): Promise<ServiceResponse<PaginatedResult<Omit<User, 'password'>>>>;

  /**
   * Update user
   */
  updateUser(
    userId: string,
    userData: Partial<Omit<User, 'id' | 'email' | 'createdAt' | 'updatedAt'>>,
  ): Promise<ServiceResponse<User>>;

  /**
   * Delete user
   */
  deleteUser(userId: string): Promise<ServiceResponse<void>>;

  /**
   * Verify user password
   */
  verifyPassword(email: string, password: string): Promise<ServiceResponse<User>>;
}
