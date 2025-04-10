import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response.util';
import { equipmentService } from '../services';

export class EquipmentController {
  /**
   * Get all equipment with pagination
   */
  getAllEquipment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      if (page < 1 || limit < 1) {
        return sendError(res, 'Page and limit must be positive integers');
      }

      const result = await equipmentService.getAllEquipment({ page, limit });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to retrieve equipment');
      }

      sendSuccess(res, result.data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get equipment by ID
   */
  getEquipmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const equipmentId = req.params.id;

      if (!equipmentId) {
        return sendError(res, 'Invalid equipment ID');
      }

      const result = await equipmentService.getEquipmentById(equipmentId);

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to retrieve equipment');
      }

      sendSuccess(res, result.data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new equipment
   */
  createEquipment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { equipmentName, equipmentType, locationLatitude, locationLongitude, notes } = req.body;

      // Validate required fields
      if (!equipmentName || !equipmentType) {
        return sendError(res, 'Missing required equipment fields');
      }

      const result = await equipmentService.createEquipment({
        equipmentName,
        equipmentType,
        locationLatitude,
        locationLongitude,
        notes,
      });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to create equipment');
      }

      sendSuccess(res, result.data, 'Equipment created successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update equipment
   */
  updateEquipment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const equipmentId = req.params.id;

      if (!equipmentId) {
        return sendError(res, 'Invalid equipment ID');
      }

      const { equipmentName, equipmentType, locationLatitude, locationLongitude, notes } = req.body;

      const result = await equipmentService.updateEquipment(equipmentId, {
        equipmentName,
        equipmentType,
        locationLatitude,
        locationLongitude,
        notes,
      });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to update equipment');
      }

      sendSuccess(res, result.data, 'Equipment updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete equipment
   */
  deleteEquipment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const equipmentId = req.params.id;

      if (!equipmentId) {
        return sendError(res, 'Invalid equipment ID');
      }

      const result = await equipmentService.deleteEquipment(equipmentId);

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to delete equipment');
      }

      sendSuccess(res, undefined, 'Equipment deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
