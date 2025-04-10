import { ServiceResponse, PaginationParams, PaginatedResult } from '../index';
import { component } from '../../models';

/**
 * Component service interface
 */
export interface IComponentService {
  /**
   * Create a new component
   */
  createComponent(
    componentData: Omit<typeof component.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ServiceResponse<typeof component.$inferSelect>>;

  /**
   * Get component by ID
   */
  getComponentById(id: string): Promise<ServiceResponse<typeof component.$inferSelect>>;

  /**
   * Get all components with pagination
   */
  getAllComponents(
    pagination: PaginationParams,
  ): Promise<ServiceResponse<PaginatedResult<typeof component.$inferSelect>>>;

  /**
   * Update component
   */
  updateComponent(
    id: string,
    componentData: Partial<Omit<typeof component.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<ServiceResponse<typeof component.$inferSelect>>;

  /**
   * Delete component
   */
  deleteComponent(id: string): Promise<ServiceResponse<void>>;
}
