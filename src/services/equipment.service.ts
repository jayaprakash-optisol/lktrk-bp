import { eq, and } from 'drizzle-orm';
import { db } from '../config/database.config';
import { equipment } from '../models';
import { ServiceResponse, PaginationParams, PaginatedResult } from '../types';
import { createServiceResponse, createNotFoundError } from '../utils/response.util';
import { StatusCodes } from 'http-status-codes';
import { IEquipmentService } from '../types/interfaces';
import crypto from 'crypto';
import { Singleton } from '../utils/service.util';

interface ErrorWithStatusCode extends Error {
  statusCode: number;
}

@Singleton
export class EquipmentService implements IEquipmentService {
  /**
   * Create a new equipment
   */
  async createEquipment(
    equipmentData: Omit<typeof equipment.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ServiceResponse<typeof equipment.$inferSelect>> {
    try {
      const result = await db
        .insert(equipment)
        .values({
          ...equipmentData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!result.length) {
        throw new Error('Failed to create equipment');
      }

      return createServiceResponse(true, result[0], undefined, StatusCodes.CREATED);
    } catch (error) {
      return createServiceResponse<typeof equipment.$inferSelect>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.BAD_REQUEST,
      );
    }
  }

  /**
   * Get equipment by ID
   */
  async getEquipmentById(id: string): Promise<ServiceResponse<typeof equipment.$inferSelect>> {
    try {
      const result = await db.select().from(equipment).where(eq(equipment.id, id)).limit(1);

      if (!result.length) {
        throw createNotFoundError(`Equipment with ID ${id} not found`);
      }

      return createServiceResponse(true, result[0]);
    } catch (error) {
      const statusCode =
        error instanceof Error && 'statusCode' in error
          ? (error as ErrorWithStatusCode).statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      return createServiceResponse<typeof equipment.$inferSelect>(
        false,
        undefined,
        (error as Error).message,
        statusCode,
      );
    }
  }

  /**
   * Get all equipment with pagination
   */
  async getAllEquipment(
    pagination: PaginationParams,
  ): Promise<ServiceResponse<PaginatedResult<typeof equipment.$inferSelect>>> {
    try {
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await db.select().from(equipment).where(eq(equipment.isDeleted, false));
      const total = countResult.length;

      // Get equipment with pagination
      const result = await db
        .select()
        .from(equipment)
        .where(eq(equipment.isDeleted, false))
        .limit(limit)
        .offset(offset);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);

      const paginatedResult: PaginatedResult<typeof equipment.$inferSelect> = {
        items: result,
        total,
        page,
        limit,
        totalPages,
      };

      return createServiceResponse(true, paginatedResult);
    } catch (error) {
      return createServiceResponse<PaginatedResult<typeof equipment.$inferSelect>>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update equipment
   */
  async updateEquipment(
    id: string,
    equipmentData: Partial<Omit<typeof equipment.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<ServiceResponse<typeof equipment.$inferSelect>> {
    try {
      // Check if equipment exists
      const existingEquipment = await db
        .select()
        .from(equipment)
        .where(eq(equipment.id, id))
        .limit(1);

      if (!existingEquipment.length) {
        throw createNotFoundError(`Equipment with ID ${id} not found`);
      }

      // Update equipment
      const result = await db
        .update(equipment)
        .set({ ...equipmentData, updatedAt: new Date() })
        .where(eq(equipment.id, id))
        .returning();

      return createServiceResponse(true, result[0]);
    } catch (error) {
      const statusCode =
        error instanceof Error && 'statusCode' in error
          ? (error as ErrorWithStatusCode).statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      return createServiceResponse<typeof equipment.$inferSelect>(
        false,
        undefined,
        (error as Error).message,
        statusCode,
      );
    }
  }

  /**
   * Delete equipment (soft delete)
   */
  async deleteEquipment(id: string): Promise<ServiceResponse<void>> {
    try {
      // Check if equipment exists
      const existingEquipment = await db
        .select()
        .from(equipment)
        .where(eq(equipment.id, id))
        .limit(1);

      if (!existingEquipment.length) {
        throw createNotFoundError(`Equipment with ID ${id} not found`);
      }

      // Soft delete
      await db
        .update(equipment)
        .set({ isDeleted: true, updatedAt: new Date() })
        .where(eq(equipment.id, id));

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
