import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const projectController = new ProjectController();

router.get('/', authenticate, projectController.getAllProjects);
router.get('/:id', authenticate, projectController.getProjectById);
router.post('/', authenticate, authorize('admin'), projectController.createProject);
router.put('/:id', authenticate, authorize('admin'), projectController.updateProject);
router.delete('/:id', authenticate, authorize('admin'), projectController.deleteProject);

export default router;
