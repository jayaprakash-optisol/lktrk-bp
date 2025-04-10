import { pgTable, varchar, uuid } from 'drizzle-orm/pg-core';
import { baseColumns } from './base.schema';
import { moduleEnum, accessLevelEnum } from './enums';
import { relations } from 'drizzle-orm';
import { user } from './user.schema';

// Role table - stores basic role information
export const role = pgTable('role', {
  ...baseColumns,
  name: varchar('name').notNull(),
  description: varchar('description'),
});

// RoleModuleAccess table - stores access levels for each module
export const roleModuleAccess = pgTable('role_module_access', {
  ...baseColumns,
  roleId: uuid('role_id')
    .notNull()
    .references(() => role.id),
  module: moduleEnum('module').notNull(),
  accessLevel: accessLevelEnum('access_level').notNull().default('no_access'),
});

// Define relationships
export const roleRelations = relations(role, ({ many }) => ({
  users: many(user),
  moduleAccess: many(roleModuleAccess),
}));

export const roleModuleAccessRelations = relations(roleModuleAccess, ({ one }) => ({
  role: one(role, {
    fields: [roleModuleAccess.roleId],
    references: [role.id],
  }),
}));

// Predefined roles (these would be seeded in the database)
export const PREDEFINED_ROLES = {
  DBA: 'DBA - Data base administrator',
  CTO: 'CTO - Chief Technology Officer',
  COO: 'COO - Chief Operating Officer',
  VP: 'VP - Vice President',
  PM: 'PM - Project Manager',
} as const;
