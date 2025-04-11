import { Router } from 'express';
import { EquipmentController } from '../controllers/equipment.controller';
import {
  validateCreateEquipment,
  validateUpdateEquipment,
  validateEquipmentIdParam,
} from '../validators/equipment.validator';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const equipmentController = new EquipmentController();

// Get all equipment
router.get('/', authenticate, equipmentController.getAllEquipment);

// Get equipment by id
router.get('/:id', authenticate, validateEquipmentIdParam, equipmentController.getEquipmentById);

// Create new equipment
router.post('/', authenticate, validateCreateEquipment, equipmentController.createEquipment);

// Update equipment
router.put(
  '/:id',
  authenticate,
  validateEquipmentIdParam,
  validateUpdateEquipment,
  equipmentController.updateEquipment,
);

// Delete equipment
router.delete('/:id', authenticate, validateEquipmentIdParam, equipmentController.deleteEquipment);

export default router;
