import { EquipmentController } from '../../../src/controllers';
import { EquipmentService } from '../../../src/services';
import { mockRequest, mockResponse, mockNext } from '../../mocks';
import { EquipmentType } from '../../../src/types/interfaces';

// Mock equipment data
const mockEquipment = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  equipmentName: 'Test Equipment',
  equipmentType: 'storage_tank' as EquipmentType,
  locationLatitude: 29.7604,
  locationLongitude: -95.3698,
  notes: 'Test notes',
  createdAt: new Date('2023-01-01T00:00:00Z'),
  updatedAt: new Date('2023-01-01T00:00:00Z'),
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
    createdAt: new Date('2023-01-02T00:00:00Z'),
    updatedAt: new Date('2023-01-02T00:00:00Z'),
  },
];

// Mock the EquipmentService
jest.mock('../../../src/services/equipment.service', () => {
  // Create mock functions for each method
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

describe('EquipmentController', () => {
  let equipmentController: EquipmentController;
  let mockEquipmentService: any;

  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();

    // Get instance of controller
    equipmentController = new EquipmentController();

    // Get mocked equipment service
    mockEquipmentService = EquipmentService.getInstance();
  });

  describe('getAllEquipment', () => {
    it('should return all equipment with pagination', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.query = { page: '1', limit: '10' };

      const paginatedData = {
        equipment: mockEquipmentList,
        page: 1,
        limit: 10,
        total: 2,
      };

      mockEquipmentService.getAllEquipment.mockResolvedValue({
        success: true,
        statusCode: 200,
        data: paginatedData,
      });

      // Act
      await equipmentController.getAllEquipment(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.getAllEquipment).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        type: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: paginatedData,
        error: undefined,
        message: 'Operation successful',
        statusCode: 200,
      });
    });

    it('should use default pagination if not provided', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.query = {};

      const paginatedData = {
        equipment: mockEquipmentList,
        page: 1,
        limit: 10,
        total: 2,
      };

      mockEquipmentService.getAllEquipment.mockResolvedValue({
        success: true,
        data: paginatedData,
        statusCode: 200,
        message: 'Equipment retrieved successfully',
      });

      // Act
      await equipmentController.getAllEquipment(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.getAllEquipment).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        type: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should filter equipment by search term', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.query = { search: 'Test' };

      const paginatedData = {
        equipment: [mockEquipment],
        page: 1,
        limit: 10,
        total: 1,
      };

      mockEquipmentService.getAllEquipment.mockResolvedValue({
        success: true,
        data: paginatedData,
        statusCode: 200,
      });

      // Act
      await equipmentController.getAllEquipment(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.getAllEquipment).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'Test',
        type: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should filter equipment by type', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.query = { type: 'storage_tank' };

      const paginatedData = {
        equipment: [mockEquipment],
        page: 1,
        limit: 10,
        total: 1,
      };

      mockEquipmentService.getAllEquipment.mockResolvedValue({
        success: true,
        data: paginatedData,
        statusCode: 200,
      });

      // Act
      await equipmentController.getAllEquipment(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.getAllEquipment).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        type: 'storage_tank',
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle invalid page and limit parameters', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.query = { page: '0', limit: '-1' };

      // Act
      await equipmentController.getAllEquipment(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.getAllEquipment).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Operation failed',
        error: 'Page and limit must be positive integers',
        statusCode: 400,
      });
    });

    it('should handle service failure', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.query = { page: '1', limit: '10' };

      mockEquipmentService.getAllEquipment.mockResolvedValue({
        success: false,
        error: 'Database error',
        statusCode: 500,
      });

      // Act
      await equipmentController.getAllEquipment(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.getAllEquipment).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        type: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Operation failed',
        error: 'Database error',
        statusCode: 400,
      });
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();

      mockEquipmentService.getAllEquipment.mockRejectedValue(new Error('Unexpected error'));

      // Act
      await equipmentController.getAllEquipment(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.getAllEquipment).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getEquipmentById', () => {
    it('should return equipment by id', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.params = { id: mockEquipment.id };

      mockEquipmentService.getEquipmentById.mockResolvedValue({
        success: true,
        data: mockEquipment,
        statusCode: 200,
      });

      // Act
      await equipmentController.getEquipmentById(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.getEquipmentById).toHaveBeenCalledWith(mockEquipment.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockEquipment,
        error: undefined,
        message: 'Operation successful',
        statusCode: 200,
      });
    });

    it('should handle missing equipment id', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.params = {};

      // Act
      await equipmentController.getEquipmentById(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.getEquipmentById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Operation failed',
        error: 'Invalid equipment ID',
        statusCode: 400,
      });
    });

    it('should handle equipment not found', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.params = { id: 'non-existent-id' };

      mockEquipmentService.getEquipmentById.mockResolvedValue({
        success: false,
        error: 'Equipment with the provided ID does not exist',
        statusCode: 404,
      });

      // Act
      await equipmentController.getEquipmentById(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.getEquipmentById).toHaveBeenCalledWith('non-existent-id');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Operation failed',
        error: 'Equipment with the provided ID does not exist',
        statusCode: 404,
      });
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.params = { id: mockEquipment.id };

      mockEquipmentService.getEquipmentById.mockRejectedValue(new Error('Unexpected error'));

      // Act
      await equipmentController.getEquipmentById(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.getEquipmentById).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('createEquipment', () => {
    it('should create new equipment successfully', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.body = {
        equipmentName: 'New Equipment',
        equipmentType: 'vessel',
        locationLatitude: 30.1234,
        locationLongitude: -95.5678,
        notes: 'Some notes about the new equipment',
      };

      mockEquipmentService.createEquipment.mockResolvedValue({
        success: true,
        data: {
          id: 'new-id',
          ...req.body,
        },
        statusCode: 201,
      });

      // Act
      await equipmentController.createEquipment(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.createEquipment).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: 'new-id',
          ...req.body,
        },
        error: undefined,
        message: 'Equipment created successfully',
        statusCode: 201,
      });
    });

    it('should handle service failure on creation', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.body = {
        equipmentName: 'New Equipment',
        equipmentType: 'invalid_type',
      };

      mockEquipmentService.createEquipment.mockResolvedValue({
        success: false,
        error: 'Invalid equipment type',
        statusCode: 400,
      });

      // Act
      await equipmentController.createEquipment(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.createEquipment).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Operation failed',
        error: 'Invalid equipment type',
        statusCode: 400,
      });
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.body = {
        equipmentName: 'New Equipment',
        equipmentType: 'vessel',
      };

      mockEquipmentService.createEquipment.mockRejectedValue(new Error('Unexpected error'));

      // Act
      await equipmentController.createEquipment(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.createEquipment).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('updateEquipment', () => {
    it('should update equipment successfully', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.params = { id: mockEquipment.id };
      req.body = {
        equipmentName: 'Updated Equipment',
        notes: 'Updated notes',
      };

      const updatedEquipment = {
        ...mockEquipment,
        ...req.body,
      };

      mockEquipmentService.updateEquipment.mockResolvedValue({
        success: true,
        data: updatedEquipment,
        statusCode: 200,
      });

      // Act
      await equipmentController.updateEquipment(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.updateEquipment).toHaveBeenCalledWith(mockEquipment.id, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedEquipment,
        error: undefined,
        message: 'Equipment updated successfully',
        statusCode: 200,
      });
    });

    it('should handle missing equipment id', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.params = {};
      req.body = {
        equipmentName: 'Updated Equipment',
      };

      // Act
      await equipmentController.updateEquipment(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.updateEquipment).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Operation failed',
        error: 'Invalid equipment ID',
        statusCode: 400,
      });
    });

    it('should handle equipment not found', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.params = { id: 'non-existent-id' };
      req.body = {
        equipmentName: 'Updated Equipment',
      };

      mockEquipmentService.updateEquipment.mockResolvedValue({
        success: false,
        error: 'Equipment with the provided ID does not exist',
        statusCode: 404,
      });

      // Act
      await equipmentController.updateEquipment(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.updateEquipment).toHaveBeenCalledWith(
        'non-existent-id',
        req.body,
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Operation failed',
        error: 'Equipment with the provided ID does not exist',
        statusCode: 404,
      });
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.params = { id: mockEquipment.id };
      req.body = {
        equipmentName: 'Updated Equipment',
      };

      mockEquipmentService.updateEquipment.mockRejectedValue(new Error('Unexpected error'));

      // Act
      await equipmentController.updateEquipment(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.updateEquipment).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('deleteEquipment', () => {
    it('should delete equipment successfully', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.params = { id: mockEquipment.id };

      mockEquipmentService.deleteEquipment.mockResolvedValue({
        success: true,
        message: 'Equipment deleted successfully',
        statusCode: 200,
      });

      // Act
      await equipmentController.deleteEquipment(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.deleteEquipment).toHaveBeenCalledWith(mockEquipment.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: undefined,
        error: undefined,
        message: 'Equipment deleted successfully',
        statusCode: 200,
      });
    });

    it('should handle missing equipment id', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.params = {};

      // Act
      await equipmentController.deleteEquipment(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.deleteEquipment).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Operation failed',
        error: 'Invalid equipment ID',
        statusCode: 400,
      });
    });

    it('should handle equipment not found', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.params = { id: 'non-existent-id' };

      mockEquipmentService.deleteEquipment.mockResolvedValue({
        success: false,
        error: 'Equipment with the provided ID does not exist',
        statusCode: 404,
      });

      // Act
      await equipmentController.deleteEquipment(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.deleteEquipment).toHaveBeenCalledWith('non-existent-id');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Operation failed',
        error: 'Equipment with the provided ID does not exist',
        statusCode: 404,
      });
    });

    it('should handle unexpected errors', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      req.params = { id: mockEquipment.id };

      mockEquipmentService.deleteEquipment.mockRejectedValue(new Error('Unexpected error'));

      // Act
      await equipmentController.deleteEquipment(req, res, mockNext);

      // Assert
      expect(mockEquipmentService.deleteEquipment).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
