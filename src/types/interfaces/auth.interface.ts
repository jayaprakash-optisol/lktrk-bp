import { User, ServiceResponse } from '../index';
import { RegisterUserData } from '../../services/auth.service';

/**
 * Auth service interface
 */
export interface IAuthService {
  /**
   * Register a new user
   */
  register(userData: RegisterUserData): Promise<ServiceResponse<Omit<User, 'password'>>>;

  /**
   * Login user
   */
  login(email: string, password: string): Promise<ServiceResponse<{ user: User; token: string }>>;

  /**
   * Refresh token
   */
  refreshToken(userId: string): Promise<ServiceResponse<{ token: string }>>;
}
