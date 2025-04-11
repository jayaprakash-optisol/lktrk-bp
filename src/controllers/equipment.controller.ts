import { Request, Response, NextFunction } from 'express';
import { IEquipmentService, EquipmentType } from '../types/interfaces';
import { sendSuccess, sendError } from '../utils/response.util';
import { EquipmentService } from '../services/equipment.service';
import { equipmentTypeEnum } from '../models/enums';

export class EquipmentController {
  private readonly equipmentService: IEquipmentService;

  constructor() {
    this.equipmentService = EquipmentService.getInstance();
  }

  /**
   * Get all equipment with pagination and optional filtering
   */
  getAllEquipment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const search = req.query.search as string;
      const typeParam = req.query.type as string;

      // Validate if the type is a valid enum value
      let type: EquipmentType | undefined = undefined;
      if (typeParam && equipmentTypeEnum.enumValues.includes(typeParam as any)) {
        type = typeParam as EquipmentType;
      }

      if (page < 1 || limit < 1) {
        return sendError(res, 'Page and limit must be positive integers');
      }

      const result = await this.equipmentService.getAllEquipment({
        page,
        limit,
        search,
        type,
      });

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

      const result = await this.equipmentService.getEquipmentById(equipmentId);

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to retrieve equipment', result.statusCode);
      }

      sendSuccess(res, result.data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create new equipment
   */
  createEquipment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { equipmentName, equipmentType, locationLatitude, locationLongitude, notes } = req.body;

      // Type validation is done by the validator middleware, so we can safely use it here
      const result = await this.equipmentService.createEquipment({
        equipmentName,
        equipmentType,
        locationLatitude,
        locationLongitude,
        notes,
      });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to create equipment', result.statusCode);
      }

      sendSuccess(res, result.data, 'Equipment created successfully', result.statusCode);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update equipment by ID
   */
  updateEquipment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const equipmentId = req.params.id;

      if (!equipmentId) {
        return sendError(res, 'Invalid equipment ID');
      }

      const { equipmentName, equipmentType, locationLatitude, locationLongitude, notes } = req.body;

      // Type validation is done by the validator middleware, so we can safely use it here
      const result = await this.equipmentService.updateEquipment(equipmentId, {
        equipmentName,
        equipmentType,
        locationLatitude,
        locationLongitude,
        notes,
      });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to update equipment', result.statusCode);
      }

      sendSuccess(res, result.data, 'Equipment updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete equipment by ID
   */
  deleteEquipment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const equipmentId = req.params.id;

      if (!equipmentId) {
        return sendError(res, 'Invalid equipment ID');
      }

      const result = await this.equipmentService.deleteEquipment(equipmentId);

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to delete equipment', result.statusCode);
      }

      sendSuccess(res, undefined, 'Equipment deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
