import { user } from '../models';

// Database model types
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

// JWT payload type
export interface JwtPayload {
  userId: string;
  email: string;
  roleId: string;
  [key: string]: unknown;
}

// Export interfaces from the new structure
export type {
  AuthRequest,
  ServiceResponse,
  PaginationParams,
  PaginatedResult,
} from './interfaces/common.interface';
export * from './interfaces';
