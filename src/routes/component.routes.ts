import { Router } from 'express';
import { ComponentController } from '../controllers/component.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const componentController = new ComponentController();

router.get('/', authenticate, componentController.getAllComponents);
router.get('/:id', authenticate, componentController.getComponentById);
router.post('/', authenticate, authorize('admin'), componentController.createComponent);
router.put('/:id', authenticate, authorize('admin'), componentController.updateComponent);
router.delete('/:id', authenticate, authorize('admin'), componentController.deleteComponent);

export default router;
