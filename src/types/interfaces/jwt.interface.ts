import { ServiceResponse } from '../index';
import type { JwtPayload } from '../index';

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
