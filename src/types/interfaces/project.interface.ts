import { ServiceResponse, PaginationParams, PaginatedResult } from '../index';
import { project } from '../../models';

/**
 * Project service interface
 */
export interface IProjectService {
  /**
   * Create a new project
   */
  createProject(
    projectData: Omit<typeof project.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
    facilityIds?: string[],
    componentIds?: string[],
    equipmentIds?: string[],
  ): Promise<ServiceResponse<typeof project.$inferSelect>>;

  /**
   * Get project by ID
   */
  getProjectById(id: string): Promise<ServiceResponse<typeof project.$inferSelect>>;

  /**
   * Get all projects with pagination
   */
  getAllProjects(
    pagination: PaginationParams,
  ): Promise<ServiceResponse<PaginatedResult<typeof project.$inferSelect>>>;

  /**
   * Update project
   */
  updateProject(
    id: string,
    projectData: Partial<Omit<typeof project.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>,
    facilityIds?: string[],
    componentIds?: string[],
    equipmentIds?: string[],
  ): Promise<ServiceResponse<typeof project.$inferSelect>>;

  /**
   * Delete project
   */
  deleteProject(id: string): Promise<ServiceResponse<void>>;
}
