import { ServiceResponse, PaginationParams, PaginatedResult } from '../index';
import { equipment } from '../../models';

/**
 * Equipment service interface
 */
export interface IEquipmentService {
  /**
   * Create a new equipment
   */
  createEquipment(
    equipmentData: Omit<typeof equipment.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ServiceResponse<typeof equipment.$inferSelect>>;

  /**
   * Get equipment by ID
   */
  getEquipmentById(id: string): Promise<ServiceResponse<typeof equipment.$inferSelect>>;

  /**
   * Get all equipment with pagination
   */
  getAllEquipment(
    pagination: PaginationParams,
  ): Promise<ServiceResponse<PaginatedResult<typeof equipment.$inferSelect>>>;

  /**
   * Update equipment
   */
  updateEquipment(
    id: string,
    equipmentData: Partial<Omit<typeof equipment.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<ServiceResponse<typeof equipment.$inferSelect>>;

  /**
   * Delete equipment
   */
  deleteEquipment(id: string): Promise<ServiceResponse<void>>;
}
