import { eq } from 'drizzle-orm';
import { db } from '../config/database.config';
import { project, projectFacility, projectComponent, projectEquipment } from '../models';
import { ServiceResponse, PaginationParams, PaginatedResult } from '../types';
import { createServiceResponse, createNotFoundError } from '../utils/response.util';
import { StatusCodes } from 'http-status-codes';
import { IProjectService } from '../types/interfaces/project.interface';
import crypto from 'crypto';
import { Singleton } from '../utils/service.util';

interface ErrorWithStatusCode extends Error {
  statusCode: number;
}

@Singleton
export class ProjectService implements IProjectService {
  /**
   * Create a new project
   */
  async createProject(
    projectData: Omit<typeof project.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
    facilityIds: string[] = [],
    componentIds: string[] = [],
    equipmentIds: string[] = [],
  ): Promise<ServiceResponse<typeof project.$inferSelect>> {
    try {
      // Start a transaction
      const projectId = crypto.randomUUID();
      const now = new Date();

      // Insert project
      const result = await db.transaction(async tx => {
        // Insert the project
        const projectResult = await tx
          .insert(project)
          .values({
            ...projectData,
            id: projectId,
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        // Add facilities if provided
        if (facilityIds.length > 0) {
          await tx.insert(projectFacility).values(
            facilityIds.map(facilityId => ({
              id: crypto.randomUUID(),
              projectId,
              facilityId,
              createdAt: now,
              updatedAt: now,
            })),
          );
        }

        // Add components if provided
        if (componentIds.length > 0) {
          await tx.insert(projectComponent).values(
            componentIds.map(componentId => ({
              id: crypto.randomUUID(),
              projectId,
              componentId,
              createdAt: now,
              updatedAt: now,
            })),
          );
        }

        // Add equipment if provided
        if (equipmentIds.length > 0) {
          await tx.insert(projectEquipment).values(
            equipmentIds.map(equipmentId => ({
              id: crypto.randomUUID(),
              projectId,
              equipmentId,
              createdAt: now,
              updatedAt: now,
            })),
          );
        }

        return projectResult;
      });

      if (!result.length) {
        throw new Error('Failed to create project');
      }

      return createServiceResponse(true, result[0], undefined, StatusCodes.CREATED);
    } catch (error) {
      return createServiceResponse<typeof project.$inferSelect>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.BAD_REQUEST,
      );
    }
  }

  /**
   * Get project by ID
   */
  async getProjectById(id: string): Promise<ServiceResponse<typeof project.$inferSelect>> {
    try {
      const result = await db.select().from(project).where(eq(project.id, id)).limit(1);

      if (!result.length) {
        throw createNotFoundError(`Project with ID ${id} not found`);
      }

      return createServiceResponse(true, result[0]);
    } catch (error) {
      const statusCode =
        error instanceof Error && 'statusCode' in error
          ? (error as ErrorWithStatusCode).statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      return createServiceResponse<typeof project.$inferSelect>(
        false,
        undefined,
        (error as Error).message,
        statusCode,
      );
    }
  }

  /**
   * Get all projects with pagination
   */
  async getAllProjects(
    pagination: PaginationParams,
  ): Promise<ServiceResponse<PaginatedResult<typeof project.$inferSelect>>> {
    try {
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await db.select().from(project).where(eq(project.isDeleted, false));
      const total = countResult.length;

      // Get projects with pagination
      const result = await db
        .select()
        .from(project)
        .where(eq(project.isDeleted, false))
        .limit(limit)
        .offset(offset);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);

      const paginatedResult: PaginatedResult<typeof project.$inferSelect> = {
        items: result,
        total,
        page,
        limit,
        totalPages,
      };

      return createServiceResponse(true, paginatedResult);
    } catch (error) {
      return createServiceResponse<PaginatedResult<typeof project.$inferSelect>>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update project
   */
  async updateProject(
    id: string,
    projectData: Partial<Omit<typeof project.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>,
    facilityIds: string[] = [],
    componentIds: string[] = [],
    equipmentIds: string[] = [],
  ): Promise<ServiceResponse<typeof project.$inferSelect>> {
    try {
      // Check if project exists
      const existingProject = await db.select().from(project).where(eq(project.id, id)).limit(1);

      if (!existingProject.length) {
        throw createNotFoundError(`Project with ID ${id} not found`);
      }

      const now = new Date();

      // Update project in a transaction
      const result = await db.transaction(async tx => {
        // Update the project
        const updatedProject = await tx
          .update(project)
          .set({ ...projectData, updatedAt: now })
          .where(eq(project.id, id))
          .returning();

        // Update facilities if provided
        if (facilityIds.length > 0) {
          // Delete existing relationships
          await tx.delete(projectFacility).where(eq(projectFacility.projectId, id));

          // Add new relationships if there are any
          await tx.insert(projectFacility).values(
            facilityIds.map(facilityId => ({
              id: crypto.randomUUID(),
              projectId: id,
              facilityId,
              createdAt: now,
              updatedAt: now,
            })),
          );
        }

        // Update components if provided
        if (componentIds.length > 0) {
          // Delete existing relationships
          await tx.delete(projectComponent).where(eq(projectComponent.projectId, id));

          // Add new relationships if there are any
          await tx.insert(projectComponent).values(
            componentIds.map(componentId => ({
              id: crypto.randomUUID(),
              projectId: id,
              componentId,
              createdAt: now,
              updatedAt: now,
            })),
          );
        }

        // Update equipment if provided
        if (equipmentIds.length > 0) {
          // Delete existing relationships
          await tx.delete(projectEquipment).where(eq(projectEquipment.projectId, id));

          // Add new relationships if there are any
          await tx.insert(projectEquipment).values(
            equipmentIds.map(equipmentId => ({
              id: crypto.randomUUID(),
              projectId: id,
              equipmentId,
              createdAt: now,
              updatedAt: now,
            })),
          );
        }

        return updatedProject;
      });

      return createServiceResponse(true, result[0]);
    } catch (error) {
      const statusCode =
        error instanceof Error && 'statusCode' in error
          ? (error as ErrorWithStatusCode).statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      return createServiceResponse<typeof project.$inferSelect>(
        false,
        undefined,
        (error as Error).message,
        statusCode,
      );
    }
  }

  /**
   * Delete project (soft delete)
   */
  async deleteProject(id: string): Promise<ServiceResponse<void>> {
    try {
      // Check if project exists
      const existingProject = await db.select().from(project).where(eq(project.id, id)).limit(1);

      if (!existingProject.length) {
        throw createNotFoundError(`Project with ID ${id} not found`);
      }

      const now = new Date();

      // Soft delete project and related junction records in a transaction
      await db.transaction(async tx => {
        // Soft delete the project
        await tx
          .update(project)
          .set({
            isDeleted: true,
            deletedAt: now,
            updatedAt: now,
          })
          .where(eq(project.id, id));

        // Soft delete related junction records
        await tx
          .update(projectFacility)
          .set({
            isDeleted: true,
            deletedAt: now,
            updatedAt: now,
          })
          .where(eq(projectFacility.projectId, id));

        await tx
          .update(projectComponent)
          .set({
            isDeleted: true,
            deletedAt: now,
            updatedAt: now,
          })
          .where(eq(projectComponent.projectId, id));

        await tx
          .update(projectEquipment)
          .set({
            isDeleted: true,
            deletedAt: now,
            updatedAt: now,
          })
          .where(eq(projectEquipment.projectId, id));
      });

      return createServiceResponse(true, undefined);
    } catch (error) {
      const statusCode =
        error instanceof Error && 'statusCode' in error
          ? (error as ErrorWithStatusCode).statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      return createServiceResponse<void>(false, undefined, (error as Error).message, statusCode);
    }
  }
}
