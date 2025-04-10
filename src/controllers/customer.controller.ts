import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response.util';
import { customerService } from '../services';

export class CustomerController {
  /**
   * Get all customers with pagination
   */
  getAllCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      if (page < 1 || limit < 1) {
        return sendError(res, 'Page and limit must be positive integers');
      }

      const result = await customerService.getAllCustomers({ page, limit });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to retrieve customers');
      }

      sendSuccess(res, result.data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get customer by ID
   */
  getCustomerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = req.params.id;

      if (!customerId) {
        return sendError(res, 'Invalid customer ID');
      }

      const result = await customerService.getCustomerById(customerId);

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to retrieve customer');
      }

      sendSuccess(res, result.data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new customer
   */
  createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        companyName,
        parentCompanyId,
        officePhone,
        email,
        address1,
        address2,
        city,
        state,
        zipCode,
        emailDomainMfa,
        cedriReportRequired,
        status,
      } = req.body;

      // Validate required fields
      if (!companyName || !status) {
        return sendError(res, 'Company name and status are required');
      }

      const result = await customerService.createCustomer({
        companyName,
        parentCompanyId,
        officePhone,
        email,
        address1,
        address2,
        city,
        state,
        zipCode,
        emailDomainMfa,
        cedriReportRequired,
        status,
      });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to create customer');
      }

      sendSuccess(res, result.data, 'Customer created successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update customer
   */
  updateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = req.params.id;

      if (!customerId) {
        return sendError(res, 'Invalid customer ID');
      }

      const {
        companyName,
        parentCompanyId,
        officePhone,
        email,
        address1,
        address2,
        city,
        state,
        zipCode,
        emailDomainMfa,
        cedriReportRequired,
        status,
      } = req.body;

      const result = await customerService.updateCustomer(customerId, {
        companyName,
        parentCompanyId,
        officePhone,
        email,
        address1,
        address2,
        city,
        state,
        zipCode,
        emailDomainMfa,
        cedriReportRequired,
        status,
      });

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to update customer');
      }

      sendSuccess(res, result.data, 'Customer updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete customer
   */
  deleteCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = req.params.id;

      if (!customerId) {
        return sendError(res, 'Invalid customer ID');
      }

      const result = await customerService.deleteCustomer(customerId);

      if (!result.success) {
        return sendError(res, result.error ?? 'Failed to delete customer');
      }

      sendSuccess(res, undefined, 'Customer deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
