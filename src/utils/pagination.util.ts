/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { SQL, sql, and, eq, like, not, asc, desc } from 'drizzle-orm';
import { PgTable, PgColumn } from 'drizzle-orm/pg-core';

/**
 * Generic pagination parameters interface
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Generic filter parameters interface
 */
export interface FilterParams {
  [key: string]: any;
}

/**
 * Generic pagination result interface
 */
export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Filter type for building SQL conditions
 */
export type FilterCondition = {
  column: PgColumn<any>;
  operator: 'eq' | 'like' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'notEq';
  value: any;
};

/**
 * Build SQL conditions from filter parameters
 * @param filters Array of filter conditions
 * @returns SQL condition
 */
export function buildFilterConditions(filters: FilterCondition[]): SQL<unknown> {
  let conditions: SQL<unknown> = sql`1=1`;

  for (const filter of filters) {
    if (filter.value === undefined || filter.value === null) continue;

    switch (filter.operator) {
      case 'eq':
        conditions = and(conditions, eq(filter.column, filter.value)) as SQL<unknown>;
        break;
      case 'like':
        conditions = and(conditions, like(filter.column, `%${filter.value}%`)) as SQL<unknown>;
        break;
      case 'notEq':
        conditions = and(conditions, not(eq(filter.column, filter.value))) as SQL<unknown>;
        break;
      // Additional operators can be added as needed
    }
  }

  return conditions;
}

/**
 * Generic method to handle pagination and filtering for any table
 * @param db Database instance
 * @param table The table to query
 * @param paginationParams Pagination parameters (page, limit)
 * @param conditions SQL conditions for filtering
 * @param mapper Function to map database results to domain objects
 * @returns Paginated result with items, total count, page and limit
 */
export async function paginateAndFilter<T, TTable extends PgTable>(
  db: any,
  table: TTable,
  paginationParams: PaginationParams,
  conditions: SQL<unknown>,
  mapper: (items: any[]) => T[],
): Promise<PaginationResult<T>> {
  const { page, limit, sortBy, sortOrder } = paginationParams;
  const offset = (page - 1) * limit;

  // Get total count for pagination
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(table)
    .where(conditions);

  const total = totalResult[0]?.count || 0;

  // Prepare query builder
  let query = db.select().from(table).where(conditions).limit(limit).offset(offset);

  // Add sorting if specified
  if (sortBy) {
    // Check if the column exists on the table without direct access
    try {
      const sortColumn = Object.entries(table).find(([key]) => key === sortBy)?.[1];
      if (sortColumn) {
        const sortDirection = sortOrder === 'desc' ? desc : asc;
        query = query.orderBy(sortDirection(sortColumn));
      }
    } catch (error) {
      console.warn(`Sort column '${sortBy}' not found in table`, error);
    }
  }

  // Execute query
  const results = await query;

  return {
    items: mapper(results),
    total,
    page,
    limit,
  };
}

/**
 * Helper to map null values to undefined
 * @param value The value to check
 * @returns The original value or undefined if null
 */
export function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}
