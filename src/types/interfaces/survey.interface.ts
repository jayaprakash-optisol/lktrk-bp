import { ServiceResponse, PaginationParams, PaginatedResult } from '../index';
import { survey } from '../../models';

/**
 * Survey service interface
 */
export interface ISurveyService {
  /**
   * Create a new survey
   */
  createSurvey(
    surveyData: Omit<typeof survey.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ServiceResponse<typeof survey.$inferSelect>>;

  /**
   * Get survey by ID
   */
  getSurveyById(id: string): Promise<ServiceResponse<typeof survey.$inferSelect>>;

  /**
   * Get all surveys with pagination
   */
  getAllSurveys(
    pagination: PaginationParams,
  ): Promise<ServiceResponse<PaginatedResult<typeof survey.$inferSelect>>>;

  /**
   * Get surveys by facility ID
   */
  getSurveysByFacilityId(
    facilityId: string,
    pagination: PaginationParams,
  ): Promise<ServiceResponse<PaginatedResult<typeof survey.$inferSelect>>>;

  /**
   * Get surveys by project ID
   */
  getSurveysByProjectId(
    projectId: string,
    pagination: PaginationParams,
  ): Promise<ServiceResponse<PaginatedResult<typeof survey.$inferSelect>>>;

  /**
   * Update survey
   */
  updateSurvey(
    id: string,
    surveyData: Partial<Omit<typeof survey.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<ServiceResponse<typeof survey.$inferSelect>>;

  /**
   * Delete survey
   */
  deleteSurvey(id: string): Promise<ServiceResponse<void>>;
}
