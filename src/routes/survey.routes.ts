import { Router } from 'express';
import { SurveyController } from '../controllers/survey.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const surveyController = new SurveyController();

router.get('/', authenticate, surveyController.getAllSurveys);
router.get('/facility/:facilityId', authenticate, surveyController.getSurveysByFacilityId);
router.get('/project/:projectId', authenticate, surveyController.getSurveysByProjectId);
router.get('/:id', authenticate, surveyController.getSurveyById);
router.post('/', authenticate, authorize('admin'), surveyController.createSurvey);
router.put('/:id', authenticate, authorize('admin'), surveyController.updateSurvey);
router.delete('/:id', authenticate, authorize('admin'), surveyController.deleteSurvey);

export default router;
