import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { baseColumns } from './base.schema';
import { relations } from 'drizzle-orm';
import { project } from './project.schema';
import { survey } from './survey.schema';

export const regulation = pgTable('regulation', {
  ...baseColumns,
  name: varchar('name').notNull(),
  description: varchar('description'),
  code: varchar('code').notNull(),
});

// Define relationships for regulation
export const regulationRelations = relations(regulation, ({ many }) => ({
  projects: many(project),
  surveys: many(survey),
}));
