import { eq, and } from 'drizzle-orm';
import { db } from '../config/database.config';
import { facility } from '../models';
import { ServiceResponse, PaginationParams, PaginatedResult } from '../types';
import { createServiceResponse, createNotFoundError } from '../utils/response.util';
import { StatusCodes } from 'http-status-codes';
import { IFacilityService } from '../types/interfaces/facility.interface';
import crypto from 'crypto';
import { Singleton } from '../utils/service.util';

interface ErrorWithStatusCode extends Error {
  statusCode: number;
}

@Singleton
export class FacilityService implements IFacilityService {
  /**
   * Create a new facility
   */
  async createFacility(
    facilityData: Omit<typeof facility.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ServiceResponse<typeof facility.$inferSelect>> {
    try {
      const result = await db
        .insert(facility)
        .values({
          ...facilityData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!result.length) {
        throw new Error('Failed to create facility');
      }

      return createServiceResponse(true, result[0], undefined, StatusCodes.CREATED);
    } catch (error) {
      return createServiceResponse<typeof facility.$inferSelect>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.BAD_REQUEST,
      );
    }
  }

  /**
   * Get facility by ID
   */
  async getFacilityById(id: string): Promise<ServiceResponse<typeof facility.$inferSelect>> {
    try {
      const result = await db.select().from(facility).where(eq(facility.id, id)).limit(1);

      if (!result.length) {
        throw createNotFoundError(`Facility with ID ${id} not found`);
      }

      return createServiceResponse(true, result[0]);
    } catch (error) {
      const statusCode =
        error instanceof Error && 'statusCode' in error
          ? (error as ErrorWithStatusCode).statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      return createServiceResponse<typeof facility.$inferSelect>(
        false,
        undefined,
        (error as Error).message,
        statusCode,
      );
    }
  }

  /**
   * Get all facilities with pagination
   */
  async getAllFacilities(
    pagination: PaginationParams,
  ): Promise<ServiceResponse<PaginatedResult<typeof facility.$inferSelect>>> {
    try {
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await db.select().from(facility).where(eq(facility.isDeleted, false));
      const total = countResult.length;

      // Get facilities with pagination
      const result = await db
        .select()
        .from(facility)
        .where(eq(facility.isDeleted, false))
        .limit(limit)
        .offset(offset);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);

      const paginatedResult: PaginatedResult<typeof facility.$inferSelect> = {
        items: result,
        total,
        page,
        limit,
        totalPages,
      };

      return createServiceResponse(true, paginatedResult);
    } catch (error) {
      return createServiceResponse<PaginatedResult<typeof facility.$inferSelect>>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get facilities by customer ID
   */
  async getFacilitiesByCustomerId(
    customerId: string,
    pagination: PaginationParams,
  ): Promise<ServiceResponse<PaginatedResult<typeof facility.$inferSelect>>> {
    try {
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      // Get total count for this customer
      const countResult = await db
        .select()
        .from(facility)
        .where(and(eq(facility.customerId, customerId), eq(facility.isDeleted, false)));

      const total = countResult.length;

      // Get facilities with pagination
      const result = await db
        .select()
        .from(facility)
        .where(and(eq(facility.customerId, customerId), eq(facility.isDeleted, false)))
        .limit(limit)
        .offset(offset);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);

      const paginatedResult: PaginatedResult<typeof facility.$inferSelect> = {
        items: result,
        total,
        page,
        limit,
        totalPages,
      };

      return createServiceResponse(true, paginatedResult);
    } catch (error) {
      return createServiceResponse<PaginatedResult<typeof facility.$inferSelect>>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update facility
   */
  async updateFacility(
    id: string,
    facilityData: Partial<Omit<typeof facility.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<ServiceResponse<typeof facility.$inferSelect>> {
    try {
      // Check if facility exists
      const existingFacility = await db.select().from(facility).where(eq(facility.id, id)).limit(1);

      if (!existingFacility.length) {
        throw createNotFoundError(`Facility with ID ${id} not found`);
      }

      // Update facility
      const result = await db
        .update(facility)
        .set({ ...facilityData, updatedAt: new Date() })
        .where(eq(facility.id, id))
        .returning();

      return createServiceResponse(true, result[0]);
    } catch (error) {
      const statusCode =
        error instanceof Error && 'statusCode' in error
          ? (error as ErrorWithStatusCode).statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      return createServiceResponse<typeof facility.$inferSelect>(
        false,
        undefined,
        (error as Error).message,
        statusCode,
      );
    }
  }

  /**
   * Delete facility (soft delete)
   */
  async deleteFacility(id: string): Promise<ServiceResponse<void>> {
    try {
      // Check if facility exists
      const existingFacility = await db.select().from(facility).where(eq(facility.id, id)).limit(1);

      if (!existingFacility.length) {
        throw createNotFoundError(`Facility with ID ${id} not found`);
      }

      // Soft delete
      await db
        .update(facility)
        .set({
          isDeleted: true,
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(facility.id, id));

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
