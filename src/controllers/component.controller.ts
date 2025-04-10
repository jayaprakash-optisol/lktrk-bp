import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response.util';
import { componentService } from '../services';

export class ComponentController {
  /**
   * Get all components with pagination
   */
  getAllComponents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      if (page < 1 || limit < 1) {
        return sendError(res, 'Page and limit must be positive integers');
      }

      const result = await componentService.getAllComponents({ page, limit });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to retrieve components');
      }

      sendSuccess(res, result.data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get component by ID
   */
  getComponentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const componentId = req.params.id;

      if (!componentId) {
        return sendError(res, 'Invalid component ID');
      }

      const result = await componentService.getComponentById(componentId);

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to retrieve component');
      }

      sendSuccess(res, result.data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new component
   */
  createComponent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        componentSubType,
        monitoringFrequency,
        accessDifficulty,
        locationLatitude,
        locationLongitude,
        notes,
      } = req.body;

      // Validate required fields
      if (!componentSubType || !monitoringFrequency || !accessDifficulty) {
        return sendError(res, 'Missing required component fields');
      }

      const result = await componentService.createComponent({
        componentSubType,
        monitoringFrequency,
        accessDifficulty,
        locationLatitude,
        locationLongitude,
        notes,
      });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to create component');
      }

      sendSuccess(res, result.data, 'Component created successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update component
   */
  updateComponent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const componentId = req.params.id;

      if (!componentId) {
        return sendError(res, 'Invalid component ID');
      }

      const {
        componentSubType,
        monitoringFrequency,
        accessDifficulty,
        locationLatitude,
        locationLongitude,
        notes,
      } = req.body;

      const result = await componentService.updateComponent(componentId, {
        componentSubType,
        monitoringFrequency,
        accessDifficulty,
        locationLatitude,
        locationLongitude,
        notes,
      });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to update component');
      }

      sendSuccess(res, result.data, 'Component updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete component
   */
  deleteComponent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const componentId = req.params.id;

      if (!componentId) {
        return sendError(res, 'Invalid component ID');
      }

      const result = await componentService.deleteComponent(componentId);

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to delete component');
      }

      sendSuccess(res, undefined, 'Component deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
