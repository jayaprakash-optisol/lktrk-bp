import { ServiceResponse, PaginationParams, PaginatedResult } from '../index';
import { customer } from '../../models';

/**
 * Customer service interface
 */
export interface ICustomerService {
  /**
   * Create a new customer
   */
  createCustomer(
    customerData: Omit<typeof customer.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ServiceResponse<typeof customer.$inferSelect>>;

  /**
   * Get customer by ID
   */
  getCustomerById(id: string): Promise<ServiceResponse<typeof customer.$inferSelect>>;

  /**
   * Get all customers with pagination
   */
  getAllCustomers(
    pagination: PaginationParams,
  ): Promise<ServiceResponse<PaginatedResult<typeof customer.$inferSelect>>>;

  /**
   * Update customer
   */
  updateCustomer(
    id: string,
    customerData: Partial<Omit<typeof customer.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<ServiceResponse<typeof customer.$inferSelect>>;

  /**
   * Delete customer
   */
  deleteCustomer(id: string): Promise<ServiceResponse<void>>;
}
