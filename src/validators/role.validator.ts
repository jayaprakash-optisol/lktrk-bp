import { z } from 'zod';
import { createValidator } from '../utils/validator.util';
import { moduleEnum, accessLevelEnum } from '../models/enums';

// Create the access level enum type for validation
const accessLevelEnumSchema = z.enum(accessLevelEnum.enumValues as [string, ...string[]]);

// Create the module enum type for validation
const moduleEnumSchema = z.enum(moduleEnum.enumValues as [string, ...string[]]);

// Module access object schema
const moduleAccessSchema = z.object({
  module: moduleEnumSchema,
  accessLevel: accessLevelEnumSchema,
});

// Create role schema
const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  moduleAccess: z.array(moduleAccessSchema).min(1, 'At least one module access is required'),
});

// Update role schema
const updateRoleSchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    moduleAccess: z.array(moduleAccessSchema).optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

// Update role module access schema
const updateRoleModuleAccessSchema = z.object({
  moduleAccess: z.array(moduleAccessSchema).min(1, 'At least one module access is required'),
});

// Export validator middleware
export const validateCreateRole = createValidator(createRoleSchema);
export const validateUpdateRole = createValidator(updateRoleSchema);
export const validateUpdateRoleModuleAccess = createValidator(updateRoleModuleAccessSchema);
