import { ServiceResponse, PaginationParams, PaginatedResult } from '../index';
import { facility } from '../../models';

/**
 * Facility service interface
 */
export interface IFacilityService {
  /**
   * Create a new facility
   */
  createFacility(
    facilityData: Omit<typeof facility.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ServiceResponse<typeof facility.$inferSelect>>;

  /**
   * Get facility by ID
   */
  getFacilityById(id: string): Promise<ServiceResponse<typeof facility.$inferSelect>>;

  /**
   * Get all facilities with pagination
   */
  getAllFacilities(
    pagination: PaginationParams,
  ): Promise<ServiceResponse<PaginatedResult<typeof facility.$inferSelect>>>;

  /**
   * Get facilities by customer ID
   */
  getFacilitiesByCustomerId(
    customerId: string,
    pagination: PaginationParams,
  ): Promise<ServiceResponse<PaginatedResult<typeof facility.$inferSelect>>>;

  /**
   * Update facility
   */
  updateFacility(
    id: string,
    facilityData: Partial<Omit<typeof facility.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<ServiceResponse<typeof facility.$inferSelect>>;

  /**
   * Delete facility
   */
  deleteFacility(id: string): Promise<ServiceResponse<void>>;
}
