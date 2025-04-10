import { uuid, timestamp, boolean } from 'drizzle-orm/pg-core';

// Base columns that are common across all tables
export const baseColumns = {
  id: uuid('id').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  isDeleted: boolean('is_deleted').notNull().default(false),
  deletedAt: timestamp('deleted_at').defaultNow(),
};

// Helper type for tables that extend the base columns
export type BaseTable = typeof baseColumns;
