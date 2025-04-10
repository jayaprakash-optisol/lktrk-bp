import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response.util';
import { surveyService } from '../services';

export class SurveyController {
  /**
   * Get all surveys with pagination
   */
  getAllSurveys = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      if (page < 1 || limit < 1) {
        return sendError(res, 'Page and limit must be positive integers');
      }

      const result = await surveyService.getAllSurveys({ page, limit });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to retrieve surveys');
      }

      sendSuccess(res, result.data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get survey by ID
   */
  getSurveyById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const surveyId = req.params.id;

      if (!surveyId) {
        return sendError(res, 'Invalid survey ID');
      }

      const result = await surveyService.getSurveyById(surveyId);

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to retrieve survey');
      }

      sendSuccess(res, result.data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get surveys by facility ID
   */
  getSurveysByFacilityId = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const facilityId = req.params.facilityId;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      if (!facilityId) {
        return sendError(res, 'Invalid facility ID');
      }

      if (page < 1 || limit < 1) {
        return sendError(res, 'Page and limit must be positive integers');
      }

      const result = await surveyService.getSurveysByFacilityId(facilityId, {
        page,
        limit,
      });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to retrieve surveys');
      }

      sendSuccess(res, result.data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get surveys by project ID
   */
  getSurveysByProjectId = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const projectId = req.params.projectId;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      if (!projectId) {
        return sendError(res, 'Invalid project ID');
      }

      if (page < 1 || limit < 1) {
        return sendError(res, 'Page and limit must be positive integers');
      }

      const result = await surveyService.getSurveysByProjectId(projectId, {
        page,
        limit,
      });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to retrieve surveys');
      }

      sendSuccess(res, result.data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new survey
   */
  createSurvey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        customerName,
        projectId,
        facilityId,
        zone,
        regulationId,
        monitoringFrequency,
        surveyType,
        priority,
        surveyMethod,
        technology,
        primaryTechnicianId,
        date,
        notes,
      } = req.body;

      // Validate required fields
      if (
        !customerName ||
        !projectId ||
        !facilityId ||
        !zone ||
        !regulationId ||
        !monitoringFrequency ||
        !surveyType ||
        !priority ||
        !surveyMethod ||
        !technology ||
        !primaryTechnicianId ||
        !date
      ) {
        return sendError(res, 'Missing required survey fields');
      }

      const result = await surveyService.createSurvey({
        customerName,
        projectId,
        facilityId,
        zone,
        regulationId,
        monitoringFrequency,
        surveyType,
        priority,
        surveyMethod,
        technology,
        primaryTechnicianId,
        date: new Date(date),
        notes,
      });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to create survey');
      }

      sendSuccess(res, result.data, 'Survey created successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update survey
   */
  updateSurvey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const surveyId = req.params.id;

      if (!surveyId) {
        return sendError(res, 'Invalid survey ID');
      }

      const {
        customerName,
        projectId,
        facilityId,
        zone,
        regulationId,
        monitoringFrequency,
        surveyType,
        priority,
        surveyMethod,
        technology,
        primaryTechnicianId,
        date,
        notes,
      } = req.body;

      const updateData: any = {};

      if (customerName) updateData.customerName = customerName;
      if (projectId) updateData.projectId = projectId;
      if (facilityId) updateData.facilityId = facilityId;
      if (zone) updateData.zone = zone;
      if (regulationId) updateData.regulationId = regulationId;
      if (monitoringFrequency) updateData.monitoringFrequency = monitoringFrequency;
      if (surveyType) updateData.surveyType = surveyType;
      if (priority) updateData.priority = priority;
      if (surveyMethod) updateData.surveyMethod = surveyMethod;
      if (technology) updateData.technology = technology;
      if (primaryTechnicianId) updateData.primaryTechnicianId = primaryTechnicianId;
      if (date) updateData.date = new Date(date);
      if (notes !== undefined) updateData.notes = notes;

      const result = await surveyService.updateSurvey(surveyId, updateData);

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to update survey');
      }

      sendSuccess(res, result.data, 'Survey updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete survey
   */
  deleteSurvey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const surveyId = req.params.id;

      if (!surveyId) {
        return sendError(res, 'Invalid survey ID');
      }

      const result = await surveyService.deleteSurvey(surveyId);

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to delete survey');
      }

      sendSuccess(res, undefined, 'Survey deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
