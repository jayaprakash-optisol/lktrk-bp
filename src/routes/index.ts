import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import customerRoutes from './customer.routes';
import projectRoutes from './project.routes';
import facilityRoutes from './facility.routes';
import equipmentRoutes from './equipment.routes';
import componentRoutes from './component.routes';
import surveyRoutes from './survey.routes';

const router = Router();

// Register all route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/projects', projectRoutes);
router.use('/facilities', facilityRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/components', componentRoutes);
router.use('/surveys', surveyRoutes);

export default router;
