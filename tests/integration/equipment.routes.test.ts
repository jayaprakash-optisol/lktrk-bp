import { StatusCodes } from 'http-status-codes';
import { agent, mockToken } from '../mocks';
import { EquipmentService } from '../../src/services';
import { Request, Response, NextFunction } from 'express';
import { setupBasicTests } from '../mocks/test-hooks';
import { EquipmentType } from '../../src/types/interfaces';
import { v4 as uuidv4 } from 'uuid';
import 'express';

// Mock environment config to disable encryption
jest.mock('../../src/config/env.config', () => ({
  __esModule: true,
  default: {
    ...jest.requireActual('../../src/config/env.config').default,
    ENCRYPTION_ENABLED: false,
    RATE_LIMIT_ENABLED: false,
  },
}));

// Setup test hooks
setupBasicTests();

// Extend Request type to include user property
declare module 'express' {
  interface Request {
    user?: {
      id: string;
      userId?: number;
      email: string;
      roleId: string;
    };
  }
}

// Mock EquipmentService
jest.mock('../../src/services/equipment.service', () => {
  const getAllEquipment = jest.fn();
  const getEquipmentById = jest.fn();
  const createEquipment = jest.fn();
  const updateEquipment = jest.fn();
  const deleteEquipment = jest.fn();

  return {
    EquipmentService: {
      getInstance: jest.fn(() => ({
        getAllEquipment,
        getEquipmentById,
        createEquipment,
        updateEquipment,
        deleteEquipment,
      })),
    },
  };
});

// Sample equipment data
const mockEquipment = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  equipmentName: 'Test Equipment',
  equipmentType: 'storage_tank' as EquipmentType,
  locationLatitude: 29.7604,
  locationLongitude: -95.3698,
  notes: 'Test notes',
  createdAt: new Date('2023-01-01T00:00:00Z').toISOString(),
  updatedAt: new Date('2023-01-01T00:00:00Z').toISOString(),
};

const mockEquipmentList = [
  mockEquipment,
  {
    id: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
    equipmentName: 'Another Equipment',
    equipmentType: 'vessel' as EquipmentType,
    locationLatitude: 29.7605,
    locationLongitude: -95.3699,
    notes: 'Another test notes',
    createdAt: new Date('2023-01-02T00:00:00Z').toISOString(),
    updatedAt: new Date('2023-01-02T00:00:00Z').toISOString(),
  },
];

// Mock JWT verification
jest.mock('../../src/middleware/auth.middleware', () => {
  return {
    authenticate: (req: Request, res: Response, next: NextFunction) => {
      if (req.headers.authorization && req.headers.authorization !== 'Bearer undefined') {
        // Simulate authenticated user based on headers
        const roleId = typeof req.headers['x-role'] === 'string' ? req.headers['x-role'] : 'user';
        const id =
          typeof req.headers['x-user-id'] === 'string'
            ? req.headers['x-user-id']
            : '9f983688-16f7-4969-9eb9-72eb7acbefa2';
        req.user = { id, email: 'test@example.com', roleId };
        next();
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          error: 'Unauthorized',
        });
      }
    },
    authorize: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      if (roles && !roles.includes(req.user.roleId)) {
        return res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          error: 'Forbidden',
        });
      }

      next();
    },
  };
});

// Define API prefix to match app configuration
const API_PREFIX = '/api/v1';

describe('Equipment Routes', () => {
  let equipmentService: any;

  beforeAll(() => {
    equipmentService = EquipmentService.getInstance();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/equipment', () => {
    it('should return all equipment with pagination', async () => {
      // Arrange
      equipmentService.getAllEquipment.mockResolvedValue({
        success: true,
        data: {
          equipment: mockEquipmentList,
          total: mockEquipmentList.length,
          page: 1,
          limit: 10,
        },
        statusCode: StatusCodes.OK,
      });

      // Act
      const response = await agent
        .get(`${API_PREFIX}/equipment`)
        .set('Authorization', `Bearer ${mockToken}`)
        .set('x-role', 'admin');

      // Assert
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data.equipment).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
      expect(equipmentService.getAllEquipment).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        type: undefined,
      });
    });

    it('should return 401 if not authenticated', async () => {
      // Act
      const response = await agent.get(`${API_PREFIX}/equipment`);

      // Assert
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
      expect(equipmentService.getAllEquipment).not.toHaveBeenCalled();
    });

    it('should apply pagination parameters', async () => {
      // Arrange
      equipmentService.getAllEquipment.mockResolvedValue({
        success: true,
        data: {
          equipment: [mockEquipment],
          total: 2,
          page: 2,
          limit: 1,
        },
        statusCode: StatusCodes.OK,
      });

      // Act
      const response = await agent
        .get(`${API_PREFIX}/equipment?page=2&limit=1`)
        .set('Authorization', `Bearer ${mockToken}`)
        .set('x-role', 'admin');

      // Assert
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data.page).toBe(2);
      expect(response.body.data.limit).toBe(1);
      expect(equipmentService.getAllEquipment).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 1,
          search: undefined,
          type: undefined,
        }),
      );
    });

    it('should apply search filter', async () => {
      // Arrange
      equipmentService.getAllEquipment.mockResolvedValue({
        success: true,
        data: {
          equipment: [mockEquipment],
          total: 1,
          page: 1,
          limit: 10,
        },
        statusCode: StatusCodes.OK,
      });

      // Act
      const response = await agent
        .get(`${API_PREFIX}/equipment?search=Test`)
        .set('Authorization', `Bearer ${mockToken}`)
        .set('x-role', 'admin');

      // Assert
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data.equipment).toHaveLength(1);
      expect(equipmentService.getAllEquipment).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Test',
        }),
      );
    });

    it('should apply type filter', async () => {
      // Arrange
      equipmentService.getAllEquipment.mockResolvedValue({
        success: true,
        data: {
          equipment: [mockEquipment],
          total: 1,
          page: 1,
          limit: 10,
        },
        statusCode: StatusCodes.OK,
      });

      // Act
      const response = await agent
        .get(`${API_PREFIX}/equipment?type=storage_tank`)
        .set('Authorization', `Bearer ${mockToken}`)
        .set('x-role', 'admin');

      // Assert
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data.equipment).toHaveLength(1);
      expect(equipmentService.getAllEquipment).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'storage_tank',
        }),
      );
    });

    it('should handle errors from service', async () => {
      // Arrange
      equipmentService.getAllEquipment.mockResolvedValue({
        success: false,
        error: 'Database error',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });

      // Act
      const response = await agent
        .get(`${API_PREFIX}/equipment`)
        .set('Authorization', `Bearer ${mockToken}`)
        .set('x-role', 'admin');

      // Assert
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /api/equipment/:id', () => {
    it('should return equipment by id', async () => {
      // Arrange
      equipmentService.getEquipmentById.mockResolvedValue({
        success: true,
        data: mockEquipment,
        statusCode: StatusCodes.OK,
      });

      // Act
      const response = await agent
        .get(`${API_PREFIX}/equipment/${mockEquipment.id}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .set('x-role', 'admin');

      // Assert
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockEquipment.id);
      expect(response.body.data.equipmentName).toBe(mockEquipment.equipmentName);
      expect(equipmentService.getEquipmentById).toHaveBeenCalledWith(mockEquipment.id);
    });

    it('should return 404 if equipment not found', async () => {
      // Arrange
      const nonExistentId = uuidv4();
      equipmentService.getEquipmentById.mockResolvedValue({
        success: false,
        error: 'Equipment with the provided ID does not exist',
        statusCode: StatusCodes.NOT_FOUND,
      });

      // Act
      const response = await agent
        .get(`${API_PREFIX}/equipment/${nonExistentId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .set('x-role', 'admin');

      // Assert
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBe(false);
      expect(equipmentService.getEquipmentById).toHaveBeenCalledWith(nonExistentId);
    });

    it('should return 401 if not authenticated', async () => {
      // Act
      const response = await agent.get(`${API_PREFIX}/equipment/${mockEquipment.id}`);

      // Assert
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
      expect(equipmentService.getEquipmentById).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/equipment', () => {
    it('should create new equipment', async () => {
      // Arrange
      const newEquipment = {
        equipmentName: 'New Equipment',
        equipmentType: 'storage_tank' as EquipmentType,
        locationLatitude: 30.1234,
        locationLongitude: -95.5678,
        notes: 'New equipment notes',
      };

      const createdEquipment = {
        id: uuidv4(),
        ...newEquipment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      equipmentService.createEquipment.mockResolvedValue({
        success: true,
        data: createdEquipment,
        statusCode: StatusCodes.CREATED,
      });

      // Act
      const response = await agent
        .post(`${API_PREFIX}/equipment`)
        .set('Authorization', `Bearer ${mockToken}`)
        .set('x-role', 'admin')
        .send(newEquipment);

      // Assert
      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body.success).toBe(true);
      expect(response.body.data.equipmentName).toBe(newEquipment.equipmentName);
      expect(response.body.data.equipmentType).toBe(newEquipment.equipmentType);
      expect(equipmentService.createEquipment).toHaveBeenCalledWith(newEquipment);
    });

    it('should return 400 if validation fails', async () => {
      // Arrange
      const invalidEquipment = {
        // Missing required fields
        equipmentType: 'invalid_type',
      };

      // Act
      const response = await agent
        .post(`${API_PREFIX}/equipment`)
        .set('Authorization', `Bearer ${mockToken}`)
        .set('x-role', 'admin')
        .send(invalidEquipment);

      // Assert
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBe(false);
      expect(equipmentService.createEquipment).not.toHaveBeenCalled();
    });

    it('should return 401 if not authenticated', async () => {
      // Arrange
      const newEquipment = {
        equipmentName: 'New Equipment',
        equipmentType: 'storage_tank' as EquipmentType,
      };

      // Act
      const response = await agent.post(`${API_PREFIX}/equipment`).send(newEquipment);

      // Assert
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
      expect(equipmentService.createEquipment).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      // Arrange
      const newEquipment = {
        equipmentName: 'New Equipment',
        equipmentType: 'storage_tank' as EquipmentType,
        locationLatitude: 30.1234,
        locationLongitude: -95.5678,
      };

      equipmentService.createEquipment.mockResolvedValue({
        success: false,
        error: 'Database error',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });

      // Act
      const response = await agent
        .post(`${API_PREFIX}/equipment`)
        .set('Authorization', `Bearer ${mockToken}`)
        .set('x-role', 'admin')
        .send(newEquipment);

      // Assert
      expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Database error');
      expect(equipmentService.createEquipment).toHaveBeenCalledWith(newEquipment);
    });
  });

  describe('PUT /api/equipment/:id', () => {
    it('should update equipment', async () => {
      // Arrange
      const updateData = {
        equipmentName: 'Updated Equipment',
        notes: 'Updated notes',
      };

      const updatedEquipment = {
        ...mockEquipment,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      equipmentService.updateEquipment.mockResolvedValue({
        success: true,
        data: updatedEquipment,
        statusCode: StatusCodes.OK,
      });

      // Act
      const response = await agent
        .put(`${API_PREFIX}/equipment/${mockEquipment.id}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .set('x-role', 'admin')
        .send(updateData);

      // Assert
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data.equipmentName).toBe(updateData.equipmentName);
      expect(response.body.data.notes).toBe(updateData.notes);
      expect(equipmentService.updateEquipment).toHaveBeenCalledWith(mockEquipment.id, updateData);
    });

    it('should return 400 if validation fails', async () => {
      // Arrange
      const invalidData = {
        equipmentName: '', // Empty name
        equipmentType: 'invalid_type', // Invalid type
      };

      // Act
      const response = await agent
        .put(`${API_PREFIX}/equipment/${mockEquipment.id}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .set('x-role', 'admin')
        .send(invalidData);

      // Assert
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBe(false);
      expect(equipmentService.updateEquipment).not.toHaveBeenCalled();
    });

    it('should return 404 if equipment not found', async () => {
      // Arrange
      const nonExistentId = uuidv4();
      const updateData = {
        equipmentName: 'Updated Equipment',
      };

      equipmentService.updateEquipment.mockResolvedValue({
        success: false,
        error: 'Equipment with the provided ID does not exist',
        statusCode: StatusCodes.NOT_FOUND,
      });

      // Act
      const response = await agent
        .put(`${API_PREFIX}/equipment/${nonExistentId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .set('x-role', 'admin')
        .send(updateData);

      // Assert
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBe(false);
      expect(equipmentService.updateEquipment).toHaveBeenCalledWith(nonExistentId, updateData);
    });

    it('should return 401 if not authenticated', async () => {
      // Arrange
      const updateData = {
        equipmentName: 'Updated Equipment',
      };

      // Act
      const response = await agent
        .put(`${API_PREFIX}/equipment/${mockEquipment.id}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
      expect(equipmentService.updateEquipment).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/equipment/:id', () => {
    it('should delete equipment', async () => {
      // Arrange
      equipmentService.deleteEquipment.mockResolvedValue({
        success: true,
        message: 'Equipment deleted successfully',
        statusCode: StatusCodes.OK,
      });

      // Act
      const response = await agent
        .delete(`${API_PREFIX}/equipment/${mockEquipment.id}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .set('x-role', 'admin');

      // Assert
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.success).toBe(true);
      expect(equipmentService.deleteEquipment).toHaveBeenCalledWith(mockEquipment.id);
    });

    it('should return 404 if equipment not found', async () => {
      // Arrange
      const nonExistentId = uuidv4();
      equipmentService.deleteEquipment.mockResolvedValue({
        success: false,
        error: 'Equipment with the provided ID does not exist',
        statusCode: StatusCodes.NOT_FOUND,
      });

      // Act
      const response = await agent
        .delete(`${API_PREFIX}/equipment/${nonExistentId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .set('x-role', 'admin');

      // Assert
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.success).toBe(false);
      expect(equipmentService.deleteEquipment).toHaveBeenCalledWith(nonExistentId);
    });

    it('should return 401 if not authenticated', async () => {
      // Act
      const response = await agent.delete(`${API_PREFIX}/equipment/${mockEquipment.id}`);

      // Assert
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
      expect(equipmentService.deleteEquipment).not.toHaveBeenCalled();
    });
  });
});
