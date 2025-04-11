import { pgTable, varchar, uuid } from 'drizzle-orm/pg-core';
import { baseColumns } from './base.schema';
import { role, roleModuleAccess } from './role.schema';
import { moduleEnum, accessLevelEnum } from './enums';
import { relations } from 'drizzle-orm';

export const user = pgTable('user', {
  ...baseColumns,
  firstName: varchar('first_name').notNull(),
  lastName: varchar('last_name').notNull(),
  email: varchar('email').notNull().unique(),
  phoneNumber: varchar('phone_number').notNull(),
  password: varchar('password').notNull(),
  roleId: uuid('role_id')
    .notNull()
    .references(() => role.id),
});

// Define relationships
export const userRelations = relations(user, ({ one }) => ({
  role: one(role, {
    fields: [user.roleId],
    references: [role.id],
  }),
}));

// Helper type for user with role
export type UserWithRole = typeof user.$inferSelect & {
  role: typeof role.$inferSelect & {
    moduleAccess: (typeof roleModuleAccess.$inferSelect)[];
  };
};

// Example of how to check module access
export const hasModuleAccess = (
  user: UserWithRole,
  module: (typeof moduleEnum.enumValues)[number],
  requiredAccess: (typeof accessLevelEnum.enumValues)[number],
): boolean => {
  const moduleAccess = user.role.moduleAccess.find(access => access.module === module);
  if (!moduleAccess) return false;

  const accessLevels: Record<(typeof accessLevelEnum.enumValues)[number], number> = {
    no_access: 0,
    view_access: 1,
    edit_access: 2,
    full_access: 3,
  };

  return accessLevels[moduleAccess.accessLevel] >= accessLevels[requiredAccess];
};
