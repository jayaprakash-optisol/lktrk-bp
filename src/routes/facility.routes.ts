import { Router } from 'express';
import { FacilityController } from '../controllers/facility.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const facilityController = new FacilityController();

router.get('/', authenticate, facilityController.getAllFacilities);
router.get('/:id', authenticate, facilityController.getFacilityById);
router.get('/customer/:customerId', authenticate, facilityController.getFacilitiesByCustomerId);
router.post('/', authenticate, authorize('admin'), facilityController.createFacility);
router.put('/:id', authenticate, authorize('admin'), facilityController.updateFacility);
router.delete('/:id', authenticate, authorize('admin'), facilityController.deleteFacility);

export default router;
