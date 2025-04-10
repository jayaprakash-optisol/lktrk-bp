import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRegisterUser, validateUpdateUser } from '../validators/user.validator';

const router = Router();
const userController = new UserController();

router.get('/', authenticate, userController.getAllUsers);
router.get('/:id', authenticate, userController.getUserById);
router.put('/:id', authenticate, validateUpdateUser, userController.updateUser);
router.delete('/:id', authenticate, userController.deleteUser);

export default router;
