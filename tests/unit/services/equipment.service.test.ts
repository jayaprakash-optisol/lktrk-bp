import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { EquipmentType } from '../../../src/types/interfaces';

// Create mockDb for use in tests
const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  returning: jest.fn(),
  delete: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  execute: jest.fn(),
};

// Mock the database module first, before it's imported
jest.mock('../../../src/config/database.config', () => ({
  db: mockDb,
}));

// Valid UUID for tests
const MOCK_UUID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

// Mock UUID
jest.mock('uuid', () => ({
  v4: jest.fn(() => MOCK_UUID),
}));

// Mock current date for consistent testing
const NOW = new Date('2023-01-01T00:00:00Z');
jest.spyOn(global, 'Date').mockImplementation(() => NOW);

// Mock pagination utility
jest.mock('../../../src/utils/pagination.util', () => ({
  paginateAndFilter: jest
    .fn()
    .mockImplementation((db: any, table: any, params: any, conditions: any, mapper: any) => {
      return {
        items: [mockEquipment].map((item: any) => mapper([item])[0]),
        total: 5,
        page: params.page,
        limit: params.limit,
      };
    }),
  buildFilterConditions: jest.fn().mockReturnValue({}),
  nullToUndefined: jest.fn((value: any) => value),
}));

// Import after mocking
import { EquipmentService } from '../../../src/services/equipment.service';
import { paginateAndFilter } from '../../../src/utils/pagination.util';

// Mock data
const mockEquipment = {
  id: MOCK_UUID,
  equipmentName: 'Test Equipment',
  equipmentType: 'storage_tank' as EquipmentType,
  locationLatitude: 29.7604,
  locationLongitude: -95.3698,
  notes: 'Test notes',
  createdAt: NOW,
  updatedAt: NOW,
};

describe('EquipmentService', () => {
  let equipmentService: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Get singleton instance
    equipmentService = EquipmentService.getInstance();

    // Reset mock implementations
    mockDb.select.mockImplementation(() => mockDb);
    mockDb.from.mockImplementation(() => mockDb);
    mockDb.where.mockImplementation(() => mockDb);
    mockDb.limit.mockImplementation(() => mockDb);
    mockDb.offset.mockImplementation(() => mockDb);
    mockDb.orderBy.mockImplementation(() => mockDb);
    mockDb.update.mockImplementation(() => mockDb);
    mockDb.set.mockImplementation(() => mockDb);
    mockDb.delete.mockImplementation(() => mockDb);
    mockDb.insert.mockImplementation(() => mockDb);
    mockDb.values.mockImplementation(() => mockDb);
    mockDb.returning.mockImplementation(() => Promise.resolve([mockEquipment]));
    mockDb.execute.mockImplementation(() => Promise.resolve([mockEquipment]));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAllEquipment', () => {
    it('should get all equipment with pagination', async () => {
      const result = await equipmentService.getAllEquipment({
        page: 1,
        limit: 10,
      });

      expect(paginateAndFilter).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.data.equipment).toHaveLength(1);
      expect(result.data.total).toBe(5);
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
    });

    it('should filter equipment by search term', async () => {
      const result = await equipmentService.getAllEquipment({
        page: 1,
        limit: 10,
        search: 'Test',
      });

      expect(paginateAndFilter).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.equipment).toHaveLength(1);
      expect(result.data.total).toBe(5);
    });

    it('should filter equipment by type', async () => {
      const result = await equipmentService.getAllEquipment({
        page: 1,
        limit: 10,
        type: 'storage_tank',
      });

      expect(paginateAndFilter).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.equipment).toHaveLength(1);
      expect(result.data.equipment[0].equipmentType).toBe('storage_tank');
    });

    it('should handle database errors', async () => {
      // Mock error for this specific test
      (paginateAndFilter as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const result = await equipmentService.getAllEquipment({
        page: 1,
        limit: 10,
      });

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getEquipmentById', () => {
    it('should get equipment by ID', async () => {
      // Mock database query
      mockDb.select.mockImplementationOnce(() => mockDb);
      mockDb.from.mockImplementationOnce(() => mockDb);
      mockDb.where.mockImplementationOnce(() => mockDb);
      mockDb.limit.mockImplementationOnce(() => Promise.resolve([mockEquipment]));

      const result = await equipmentService.getEquipmentById(MOCK_UUID);

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.data.id).toBe(MOCK_UUID);
      expect(result.data.equipmentName).toBe('Test Equipment');
    });

    it('should return 404 when equipment not found', async () => {
      // Mock database query with empty result
      mockDb.select.mockImplementationOnce(() => mockDb);
      mockDb.from.mockImplementationOnce(() => mockDb);
      mockDb.where.mockImplementationOnce(() => mockDb);
      mockDb.limit.mockImplementationOnce(() => Promise.resolve([]));

      const result = await equipmentService.getEquipmentById('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.error).toBe('Equipment with the provided ID does not exist');
    });

    it('should handle database errors', async () => {
      // Mock database error
      mockDb.select.mockImplementationOnce(() => mockDb);
      mockDb.from.mockImplementationOnce(() => mockDb);
      mockDb.where.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const result = await equipmentService.getEquipmentById(MOCK_UUID);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBe('Database error');
    });
  });

  describe('createEquipment', () => {
    it('should create new equipment', async () => {
      const equipmentData = {
        equipmentName: 'New Equipment',
        equipmentType: 'vessel' as EquipmentType,
        locationLatitude: 29.7604,
        locationLongitude: -95.3698,
        notes: 'New equipment notes',
      };

      // Mock database query
      mockDb.insert.mockImplementationOnce(() => mockDb);
      mockDb.values.mockImplementationOnce(() => mockDb);
      mockDb.returning.mockImplementationOnce(() => Promise.resolve([mockEquipment]));

      const result = await equipmentService.createEquipment(equipmentData);

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(201);
      expect(result.data.id).toBe(MOCK_UUID);
      expect(result.data.equipmentName).toBe('Test Equipment');
    });

    it('should handle database errors', async () => {
      // Mock a database error
      mockDb.insert.mockImplementationOnce(() => mockDb);
      mockDb.values.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const equipmentData = {
        equipmentName: 'New Equipment',
        equipmentType: 'vessel' as EquipmentType,
      };

      const result = await equipmentService.createEquipment(equipmentData);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBe('Database error');
    });
  });

  describe('updateEquipment', () => {
    it('should update existing equipment', async () => {
      // First mock to check if equipment exists
      mockDb.select.mockImplementationOnce(() => mockDb);
      mockDb.from.mockImplementationOnce(() => mockDb);
      mockDb.where.mockImplementationOnce(() => mockDb);
      mockDb.limit.mockImplementationOnce(() => Promise.resolve([mockEquipment]));

      // Second mock for update operation
      mockDb.update.mockImplementationOnce(() => mockDb);
      mockDb.set.mockImplementationOnce(() => mockDb);
      mockDb.where.mockImplementationOnce(() => Promise.resolve({ rowCount: 1 }));

      // Third mock to get updated equipment
      const updatedEquipment = {
        ...mockEquipment,
        equipmentName: 'Updated Equipment',
      };
      mockDb.select.mockImplementationOnce(() => mockDb);
      mockDb.from.mockImplementationOnce(() => mockDb);
      mockDb.where.mockImplementationOnce(() => mockDb);
      mockDb.limit.mockImplementationOnce(() => Promise.resolve([updatedEquipment]));

      const updateData = {
        equipmentName: 'Updated Equipment',
      };

      const result = await equipmentService.updateEquipment(MOCK_UUID, updateData);

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.data.equipmentName).toBe('Updated Equipment');
    });

    it('should return 404 when equipment not found', async () => {
      // Mock empty result for equipment existence check
      mockDb.select.mockImplementationOnce(() => mockDb);
      mockDb.from.mockImplementationOnce(() => mockDb);
      mockDb.where.mockImplementationOnce(() => mockDb);
      mockDb.limit.mockImplementationOnce(() => Promise.resolve([]));

      const updateData = {
        equipmentName: 'Updated Equipment',
      };

      const result = await equipmentService.updateEquipment('non-existent-id', updateData);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.error).toBe('Equipment with the provided ID does not exist');
    });

    it('should handle database errors', async () => {
      // Mock a database error
      mockDb.select.mockImplementationOnce(() => mockDb);
      mockDb.from.mockImplementationOnce(() => mockDb);
      mockDb.where.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const updateData = {
        equipmentName: 'Updated Equipment',
      };

      const result = await equipmentService.updateEquipment(MOCK_UUID, updateData);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBe('Database error');
    });
  });

  describe('deleteEquipment', () => {
    it('should delete existing equipment', async () => {
      // First mock to check if equipment exists
      mockDb.select.mockImplementationOnce(() => mockDb);
      mockDb.from.mockImplementationOnce(() => mockDb);
      mockDb.where.mockImplementationOnce(() => mockDb);
      mockDb.limit.mockImplementationOnce(() => Promise.resolve([mockEquipment]));

      // Second mock for delete operation
      mockDb.delete.mockImplementationOnce(() => mockDb);
      mockDb.where.mockImplementationOnce(() => Promise.resolve({ rowCount: 1 }));

      const result = await equipmentService.deleteEquipment(MOCK_UUID);

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Equipment deleted successfully');
    });

    it('should return 404 when equipment not found', async () => {
      // Mock empty result for equipment existence check
      mockDb.select.mockImplementationOnce(() => mockDb);
      mockDb.from.mockImplementationOnce(() => mockDb);
      mockDb.where.mockImplementationOnce(() => mockDb);
      mockDb.limit.mockImplementationOnce(() => Promise.resolve([]));

      const result = await equipmentService.deleteEquipment('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(404);
      expect(result.error).toBe('Equipment with the provided ID does not exist');
    });

    it('should handle database errors', async () => {
      // Mock a database error
      mockDb.select.mockImplementationOnce(() => mockDb);
      mockDb.from.mockImplementationOnce(() => mockDb);
      mockDb.where.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const result = await equipmentService.deleteEquipment(MOCK_UUID);

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error).toBe('Database error');
    });
  });
});
