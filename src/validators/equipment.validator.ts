import { z } from 'zod';
import { createValidator } from '../utils/validator.util';
import { equipmentTypeEnum } from '../models/enums';

// Create a Zod enum validator from the equipment type enum values
const equipmentTypeValidator = z.enum(equipmentTypeEnum.enumValues as [string, ...string[]]);

// Equipment creation schema
const createEquipmentSchema = z.object({
  equipmentName: z.string().min(2, 'Equipment name must be at least 2 characters').max(100),
  equipmentType: equipmentTypeValidator.describe('Equipment type'),
  locationLatitude: z.number().optional(),
  locationLongitude: z.number().optional(),
  notes: z.string().optional(),
});

// Equipment update schema
const updateEquipmentSchema = z.object({
  equipmentName: z
    .string()
    .min(2, 'Equipment name must be at least 2 characters')
    .max(100)
    .optional(),
  equipmentType: equipmentTypeValidator.optional(),
  locationLatitude: z.number().optional().nullable(),
  locationLongitude: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// Equipment ID parameter schema
const equipmentIdSchema = z.object({
  id: z.string().uuid(),
});

/**
 * Validate equipment creation request
 */
export const validateCreateEquipment = createValidator(createEquipmentSchema);

/**
 * Validate equipment update request
 */
export const validateUpdateEquipment = createValidator(updateEquipmentSchema, 'body');
export const validateEquipmentIdParam = createValidator(equipmentIdSchema, 'params');
