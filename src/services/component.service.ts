import { eq, and } from 'drizzle-orm';
import { db } from '../config/database.config';
import { component } from '../models';
import { ServiceResponse, PaginationParams, PaginatedResult } from '../types';
import { createServiceResponse, createNotFoundError } from '../utils/response.util';
import { StatusCodes } from 'http-status-codes';
import { IComponentService } from '../types/interfaces';
import crypto from 'crypto';
import { Singleton } from '../utils/service.util';

interface ErrorWithStatusCode extends Error {
  statusCode: number;
}

@Singleton
export class ComponentService implements IComponentService {
  /**
   * Create a new component
   */
  async createComponent(
    componentData: Omit<typeof component.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ServiceResponse<typeof component.$inferSelect>> {
    try {
      const result = await db
        .insert(component)
        .values({
          ...componentData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!result.length) {
        throw new Error('Failed to create component');
      }

      return createServiceResponse(true, result[0], undefined, StatusCodes.CREATED);
    } catch (error) {
      return createServiceResponse<typeof component.$inferSelect>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.BAD_REQUEST,
      );
    }
  }

  /**
   * Get component by ID
   */
  async getComponentById(id: string): Promise<ServiceResponse<typeof component.$inferSelect>> {
    try {
      const result = await db.select().from(component).where(eq(component.id, id)).limit(1);

      if (!result.length) {
        throw createNotFoundError(`Component with ID ${id} not found`);
      }

      return createServiceResponse(true, result[0]);
    } catch (error) {
      const statusCode =
        error instanceof Error && 'statusCode' in error
          ? (error as ErrorWithStatusCode).statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      return createServiceResponse<typeof component.$inferSelect>(
        false,
        undefined,
        (error as Error).message,
        statusCode,
      );
    }
  }

  /**
   * Get all components with pagination
   */
  async getAllComponents(
    pagination: PaginationParams,
  ): Promise<ServiceResponse<PaginatedResult<typeof component.$inferSelect>>> {
    try {
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await db.select().from(component).where(eq(component.isDeleted, false));
      const total = countResult.length;

      // Get components with pagination
      const result = await db
        .select()
        .from(component)
        .where(eq(component.isDeleted, false))
        .limit(limit)
        .offset(offset);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);

      const paginatedResult: PaginatedResult<typeof component.$inferSelect> = {
        items: result,
        total,
        page,
        limit,
        totalPages,
      };

      return createServiceResponse(true, paginatedResult);
    } catch (error) {
      return createServiceResponse<PaginatedResult<typeof component.$inferSelect>>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update component
   */
  async updateComponent(
    id: string,
    componentData: Partial<Omit<typeof component.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<ServiceResponse<typeof component.$inferSelect>> {
    try {
      // Check if component exists
      const existingComponent = await db
        .select()
        .from(component)
        .where(eq(component.id, id))
        .limit(1);

      if (!existingComponent.length) {
        throw createNotFoundError(`Component with ID ${id} not found`);
      }

      // Update component
      const result = await db
        .update(component)
        .set({ ...componentData, updatedAt: new Date() })
        .where(eq(component.id, id))
        .returning();

      return createServiceResponse(true, result[0]);
    } catch (error) {
      const statusCode =
        error instanceof Error && 'statusCode' in error
          ? (error as ErrorWithStatusCode).statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      return createServiceResponse<typeof component.$inferSelect>(
        false,
        undefined,
        (error as Error).message,
        statusCode,
      );
    }
  }

  /**
   * Delete component (soft delete)
   */
  async deleteComponent(id: string): Promise<ServiceResponse<void>> {
    try {
      // Check if component exists
      const existingComponent = await db
        .select()
        .from(component)
        .where(eq(component.id, id))
        .limit(1);

      if (!existingComponent.length) {
        throw createNotFoundError(`Component with ID ${id} not found`);
      }

      // Soft delete
      await db
        .update(component)
        .set({ isDeleted: true, updatedAt: new Date() })
        .where(eq(component.id, id));

      return createServiceResponse(true, undefined, undefined, StatusCodes.NO_CONTENT);
    } catch (error) {
      const statusCode =
        error instanceof Error && 'statusCode' in error
          ? (error as ErrorWithStatusCode).statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      return createServiceResponse<void>(false, undefined, (error as Error).message, statusCode);
    }
  }
}
