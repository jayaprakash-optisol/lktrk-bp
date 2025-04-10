import { User, NewUser, ServiceResponse, JwtPayload } from '../index';

/**
 * Auth service interface
 */
export interface IAuthService {
  /**
   * Register a new user
   */
  register(
    userData: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ServiceResponse<Omit<User, 'password'>>>;

  /**
   * Login user
   */
  login(email: string, password: string): Promise<ServiceResponse<{ user: User; token: string }>>;

  /**
   * Refresh token
   */
  refreshToken(userId: string): Promise<ServiceResponse<{ token: string }>>;
}

/**
 * JWT utility interface
 */
export interface IJwtUtil {
  /**
   * Generate a JWT token
   */
  generateToken(payload: JwtPayload): string;

  /**
   * Verify a JWT token
   */
  verifyToken(token: string): ServiceResponse<JwtPayload>;

  /**
   * Decode a JWT token without verification
   */
  decodeToken(token: string): JwtPayload | null;
}
