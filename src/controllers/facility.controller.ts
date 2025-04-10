import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response.util';
import { facilityService } from '../services';

export class FacilityController {
  /**
   * Get all facilities with pagination
   */
  getAllFacilities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      if (page < 1 || limit < 1) {
        return sendError(res, 'Page and limit must be positive integers');
      }

      const result = await facilityService.getAllFacilities({ page, limit });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to retrieve facilities');
      }

      sendSuccess(res, result.data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get facility by ID
   */
  getFacilityById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const facilityId = req.params.id;

      if (!facilityId) {
        return sendError(res, 'Invalid facility ID');
      }

      const result = await facilityService.getFacilityById(facilityId);

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to retrieve facility');
      }

      sendSuccess(res, result.data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get facilities by customer ID
   */
  getFacilitiesByCustomerId = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const customerId = req.params.customerId;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      if (!customerId) {
        return sendError(res, 'Invalid customer ID');
      }

      if (page < 1 || limit < 1) {
        return sendError(res, 'Page and limit must be positive integers');
      }

      const result = await facilityService.getFacilitiesByCustomerId(customerId, {
        page,
        limit,
      });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to retrieve facilities');
      }

      sendSuccess(res, result.data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new facility
   */
  createFacility = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        facilityName,
        facilityType,
        operatingStatus,
        customerId,
        locationLatitude,
        locationLongitude,
        notes,
      } = req.body;

      // Validate required fields
      if (!facilityName || !facilityType || !operatingStatus || !customerId) {
        return sendError(res, 'Missing required facility fields');
      }

      const result = await facilityService.createFacility({
        facilityName,
        facilityType,
        operatingStatus,
        customerId,
        locationLatitude,
        locationLongitude,
        notes,
      });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to create facility');
      }

      sendSuccess(res, result.data, 'Facility created successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update facility
   */
  updateFacility = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const facilityId = req.params.id;

      if (!facilityId) {
        return sendError(res, 'Invalid facility ID');
      }

      const {
        facilityName,
        facilityType,
        operatingStatus,
        customerId,
        locationLatitude,
        locationLongitude,
        notes,
      } = req.body;

      const result = await facilityService.updateFacility(facilityId, {
        facilityName,
        facilityType,
        operatingStatus,
        customerId,
        locationLatitude,
        locationLongitude,
        notes,
      });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to update facility');
      }

      sendSuccess(res, result.data, 'Facility updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete facility
   */
  deleteFacility = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const facilityId = req.params.id;

      if (!facilityId) {
        return sendError(res, 'Invalid facility ID');
      }

      const result = await facilityService.deleteFacility(facilityId);

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to delete facility');
      }

      sendSuccess(res, undefined, 'Facility deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
