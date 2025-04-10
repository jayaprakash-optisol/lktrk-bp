import { z } from 'zod';
import { createValidator } from '../utils/validator.util';
import { moduleEnum, accessLevelEnum } from '../models/enums';

// Create the access level enum type for validation
const accessLevelEnumSchema = z.enum(accessLevelEnum.enumValues as [string, ...string[]]);

// Create the module enum type for validation
const moduleEnumSchema = z.enum(moduleEnum.enumValues as [string, ...string[]]);

// Dynamic moduleAccess schema that validates each module can only have valid access level values
const moduleAccessSchema = z.record(moduleEnumSchema, accessLevelEnumSchema);

// Zod schema for validating user registration
const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email format'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    roleId: z.string().uuid().optional(),
    moduleAccess: moduleAccessSchema.optional(),
  })
  .refine(data => data.roleId || data.moduleAccess, {
    message: 'Either roleId or moduleAccess must be provided',
    path: ['roleId'],
  });

// Zod schema for validating user login
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Zod schema for validating user updates
const updateSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email('Invalid email format').optional(),
    phoneNumber: z.string().min(1, 'Phone number is required').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    roleId: z.string().uuid().optional(),
    moduleAccess: moduleAccessSchema.optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

// Export validator middleware
export const validateRegisterUser = createValidator(registerSchema);
export const validateLoginUser = createValidator(loginSchema);
export const validateUpdateUser = createValidator(updateSchema);
