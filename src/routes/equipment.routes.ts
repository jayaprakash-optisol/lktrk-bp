import { Router } from 'express';
import { EquipmentController } from '../controllers/equipment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const equipmentController = new EquipmentController();

router.get('/', authenticate, equipmentController.getAllEquipment);
router.get('/:id', authenticate, equipmentController.getEquipmentById);
router.post('/', authenticate, authorize('admin'), equipmentController.createEquipment);
router.put('/:id', authenticate, authorize('admin'), equipmentController.updateEquipment);
router.delete('/:id', authenticate, authorize('admin'), equipmentController.deleteEquipment);

export default router;
