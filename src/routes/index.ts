import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import equipmentRoutes from './equipment.routes';

const router = Router();

// Register all route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/equipment', equipmentRoutes);

export default router;
