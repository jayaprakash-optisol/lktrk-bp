import { eq } from 'drizzle-orm';
import { db } from '../config/database.config';
import { customer } from '../models';
import { ServiceResponse, PaginationParams, PaginatedResult } from '../types';
import { createServiceResponse, createNotFoundError } from '../utils/response.util';
import { StatusCodes } from 'http-status-codes';
import { ICustomerService } from '../types/interfaces/customer.interface';
import crypto from 'crypto';
import { Singleton } from '../utils/service.util';

interface ErrorWithStatusCode extends Error {
  statusCode: number;
}

@Singleton
export class CustomerService implements ICustomerService {
  /**
   * Create a new customer
   */
  async createCustomer(
    customerData: Omit<typeof customer.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ServiceResponse<typeof customer.$inferSelect>> {
    try {
      const result = await db
        .insert(customer)
        .values({
          ...customerData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!result.length) {
        throw new Error('Failed to create customer');
      }

      return createServiceResponse(true, result[0], undefined, StatusCodes.CREATED);
    } catch (error) {
      return createServiceResponse<typeof customer.$inferSelect>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.BAD_REQUEST,
      );
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(id: string): Promise<ServiceResponse<typeof customer.$inferSelect>> {
    try {
      const result = await db.select().from(customer).where(eq(customer.id, id)).limit(1);

      if (!result.length) {
        throw createNotFoundError(`Customer with ID ${id} not found`);
      }

      return createServiceResponse(true, result[0]);
    } catch (error) {
      const statusCode =
        error instanceof Error && 'statusCode' in error
          ? (error as ErrorWithStatusCode).statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      return createServiceResponse<typeof customer.$inferSelect>(
        false,
        undefined,
        (error as Error).message,
        statusCode,
      );
    }
  }

  /**
   * Get all customers with pagination
   */
  async getAllCustomers(
    pagination: PaginationParams,
  ): Promise<ServiceResponse<PaginatedResult<typeof customer.$inferSelect>>> {
    try {
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await db.select().from(customer).where(eq(customer.isDeleted, false));
      const total = countResult.length;

      // Get customers with pagination
      const result = await db
        .select()
        .from(customer)
        .where(eq(customer.isDeleted, false))
        .limit(limit)
        .offset(offset);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);

      const paginatedResult: PaginatedResult<typeof customer.$inferSelect> = {
        items: result,
        total,
        page,
        limit,
        totalPages,
      };

      return createServiceResponse(true, paginatedResult);
    } catch (error) {
      return createServiceResponse<PaginatedResult<typeof customer.$inferSelect>>(
        false,
        undefined,
        (error as Error).message,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(
    id: string,
    customerData: Partial<Omit<typeof customer.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<ServiceResponse<typeof customer.$inferSelect>> {
    try {
      // Check if customer exists
      const existingCustomer = await db.select().from(customer).where(eq(customer.id, id)).limit(1);

      if (!existingCustomer.length) {
        throw createNotFoundError(`Customer with ID ${id} not found`);
      }

      // Update customer
      const result = await db
        .update(customer)
        .set({ ...customerData, updatedAt: new Date() })
        .where(eq(customer.id, id))
        .returning();

      return createServiceResponse(true, result[0]);
    } catch (error) {
      const statusCode =
        error instanceof Error && 'statusCode' in error
          ? (error as ErrorWithStatusCode).statusCode
          : StatusCodes.INTERNAL_SERVER_ERROR;

      return createServiceResponse<typeof customer.$inferSelect>(
        false,
        undefined,
        (error as Error).message,
        statusCode,
      );
    }
  }

  /**
   * Delete customer (soft delete)
   */
  async deleteCustomer(id: string): Promise<ServiceResponse<void>> {
    try {
      // Check if customer exists
      const existingCustomer = await db.select().from(customer).where(eq(customer.id, id)).limit(1);

      if (!existingCustomer.length) {
        throw createNotFoundError(`Customer with ID ${id} not found`);
      }

      // Soft delete
      await db
        .update(customer)
        .set({
          isDeleted: true,
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(customer.id, id));

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
