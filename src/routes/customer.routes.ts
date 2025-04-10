import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const customerController = new CustomerController();

router.get('/', authenticate, customerController.getAllCustomers);
router.get('/:id', authenticate, customerController.getCustomerById);
router.post('/', authenticate, authorize('admin'), customerController.createCustomer);
router.put('/:id', authenticate, authorize('admin'), customerController.updateCustomer);
router.delete('/:id', authenticate, authorize('admin'), customerController.deleteCustomer);

export default router;
