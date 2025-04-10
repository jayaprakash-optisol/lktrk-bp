import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response.util';
import { projectService } from '../services';

export class ProjectController {
  /**
   * Get all projects with pagination
   */
  getAllProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      if (page < 1 || limit < 1) {
        return sendError(res, 'Page and limit must be positive integers');
      }

      const result = await projectService.getAllProjects({ page, limit });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to retrieve projects');
      }

      sendSuccess(res, result.data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get project by ID
   */
  getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.params.id;

      if (!projectId) {
        return sendError(res, 'Invalid project ID');
      }

      const result = await projectService.getProjectById(projectId);

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to retrieve project');
      }

      sendSuccess(res, result.data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new project
   */
  createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        projectName,
        customerId,
        regulationId,
        monitoringFrequency,
        technology,
        surveyMethod,
        startDate,
        endDate,
        notes,
        facilityIds,
        componentIds,
        equipmentIds,
      } = req.body;

      // Validate required fields
      if (
        !projectName ||
        !customerId ||
        !regulationId ||
        !monitoringFrequency ||
        !technology ||
        !surveyMethod
      ) {
        return sendError(res, 'Missing required project fields');
      }

      const result = await projectService.createProject(
        {
          projectName,
          customerId,
          regulationId,
          monitoringFrequency,
          technology,
          surveyMethod,
          startDate,
          endDate,
          notes,
        },
        facilityIds,
        componentIds,
        equipmentIds,
      );

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to create project');
      }

      sendSuccess(res, result.data, 'Project created successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update project
   */
  updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.params.id;

      if (!projectId) {
        return sendError(res, 'Invalid project ID');
      }

      const {
        projectName,
        customerId,
        regulationId,
        monitoringFrequency,
        technology,
        surveyMethod,
        startDate,
        endDate,
        notes,
        facilityIds,
        componentIds,
        equipmentIds,
      } = req.body;

      const result = await projectService.updateProject(
        projectId,
        {
          projectName,
          customerId,
          regulationId,
          monitoringFrequency,
          technology,
          surveyMethod,
          startDate,
          endDate,
          notes,
        },
        facilityIds,
        componentIds,
        equipmentIds,
      );

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to update project');
      }

      sendSuccess(res, result.data, 'Project updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete project
   */
  deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.params.id;

      if (!projectId) {
        return sendError(res, 'Invalid project ID');
      }

      const result = await projectService.deleteProject(projectId);

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to delete project');
      }

      sendSuccess(res, undefined, 'Project deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
