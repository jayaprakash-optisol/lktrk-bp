import { eq, and } from 'drizzle-orm';
import { db } from '../config/database.config';
import { survey } from '../models';
import { ServiceResponse, PaginationParams, PaginatedResult } from '../types';
import { createServiceResponse, createNotFoundError } from '../utils/response.util';
import { StatusCodes } from 'http-status-codes';
import { ISurveyService } from '../types/interfaces';
import crypto from 'crypto';
import { Singleton } from '../utils/service.util';

interface ErrorWithStatusCode extends Error {
  statusCode: number;
}

@Singleton
export class SurveyService implements ISurveyService {
  /**
   * Create a new survey
   */
  async createSurvey(
    surveyData: Omit<typeof survey.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ServiceResponse<typeof survey.$inferSelect>> {
    try {
      const result = await db
        .insert(survey)
        .values({
          ...surveyData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!result.length) {
        throw new Error('Failed to create survey');
      }

      return createServiceResponse(true, result[0], undefined, StatusCodes.CREATED);
    } catch (error) {
      return createServiceResponse<typeof survey.$inferSelect>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.BAD_REQUEST,
      );
    }
  }

  /**
   * Get survey by ID
   */
  async getSurveyById(id: string): Promise<ServiceResponse<typeof survey.$inferSelect>> {
    try {
      const result = await db.select().from(survey).where(eq(survey.id, id)).limit(1);

      if (!result.length) {
        throw createNotFoundError(`Survey with ID ${id} not found`);
      }

      return createServiceResponse(true, result[0]);
    } catch (error) {
      const statusCode =
        error instanceof Error && 'statusCode' in error
          ? (error as ErrorWithStatusCode).statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      return createServiceResponse<typeof survey.$inferSelect>(
        false,
        undefined,
        (error as Error).message,
        statusCode,
      );
    }
  }

  /**
   * Get all surveys with pagination
   */
  async getAllSurveys(
    pagination: PaginationParams,
  ): Promise<ServiceResponse<PaginatedResult<typeof survey.$inferSelect>>> {
    try {
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await db.select().from(survey).where(eq(survey.isDeleted, false));
      const total = countResult.length;

      // Get surveys with pagination
      const result = await db
        .select()
        .from(survey)
        .where(eq(survey.isDeleted, false))
        .limit(limit)
        .offset(offset);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);

      const paginatedResult: PaginatedResult<typeof survey.$inferSelect> = {
        items: result,
        total,
        page,
        limit,
        totalPages,
      };

      return createServiceResponse(true, paginatedResult);
    } catch (error) {
      return createServiceResponse<PaginatedResult<typeof survey.$inferSelect>>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get surveys by facility ID
   */
  async getSurveysByFacilityId(
    facilityId: string,
    pagination: PaginationParams,
  ): Promise<ServiceResponse<PaginatedResult<typeof survey.$inferSelect>>> {
    try {
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      // Get total count for this facility
      const countResult = await db
        .select()
        .from(survey)
        .where(and(eq(survey.facilityId, facilityId), eq(survey.isDeleted, false)));

      const total = countResult.length;

      // Get surveys with pagination
      const result = await db
        .select()
        .from(survey)
        .where(and(eq(survey.facilityId, facilityId), eq(survey.isDeleted, false)))
        .limit(limit)
        .offset(offset);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);

      const paginatedResult: PaginatedResult<typeof survey.$inferSelect> = {
        items: result,
        total,
        page,
        limit,
        totalPages,
      };

      return createServiceResponse(true, paginatedResult);
    } catch (error) {
      return createServiceResponse<PaginatedResult<typeof survey.$inferSelect>>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get surveys by project ID
   */
  async getSurveysByProjectId(
    projectId: string,
    pagination: PaginationParams,
  ): Promise<ServiceResponse<PaginatedResult<typeof survey.$inferSelect>>> {
    try {
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      // Get total count for this project
      const countResult = await db
        .select()
        .from(survey)
        .where(and(eq(survey.projectId, projectId), eq(survey.isDeleted, false)));

      const total = countResult.length;

      // Get surveys with pagination
      const result = await db
        .select()
        .from(survey)
        .where(and(eq(survey.projectId, projectId), eq(survey.isDeleted, false)))
        .limit(limit)
        .offset(offset);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);

      const paginatedResult: PaginatedResult<typeof survey.$inferSelect> = {
        items: result,
        total,
        page,
        limit,
        totalPages,
      };

      return createServiceResponse(true, paginatedResult);
    } catch (error) {
      return createServiceResponse<PaginatedResult<typeof survey.$inferSelect>>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update survey
   */
  async updateSurvey(
    id: string,
    surveyData: Partial<Omit<typeof survey.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<ServiceResponse<typeof survey.$inferSelect>> {
    try {
      // Check if survey exists
      const existingSurvey = await db.select().from(survey).where(eq(survey.id, id)).limit(1);

      if (!existingSurvey.length) {
        throw createNotFoundError(`Survey with ID ${id} not found`);
      }

      // Update survey
      const result = await db
        .update(survey)
        .set({ ...surveyData, updatedAt: new Date() })
        .where(eq(survey.id, id))
        .returning();

      return createServiceResponse(true, result[0]);
    } catch (error) {
      const statusCode =
        error instanceof Error && 'statusCode' in error
          ? (error as ErrorWithStatusCode).statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      return createServiceResponse<typeof survey.$inferSelect>(
        false,
        undefined,
        (error as Error).message,
        statusCode,
      );
    }
  }

  /**
   * Delete survey (soft delete)
   */
  async deleteSurvey(id: string): Promise<ServiceResponse<void>> {
    try {
      // Check if survey exists
      const existingSurvey = await db.select().from(survey).where(eq(survey.id, id)).limit(1);

      if (!existingSurvey.length) {
        throw createNotFoundError(`Survey with ID ${id} not found`);
      }

      // Soft delete
      await db
        .update(survey)
        .set({ isDeleted: true, updatedAt: new Date() })
        .where(eq(survey.id, id));

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
