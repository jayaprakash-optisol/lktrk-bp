import { StatusCodes } from 'http-status-codes';
import { resetMocks, setupDatabaseMocks, teardownDatabaseMocks } from '../../mocks';
import { RoleService, ModuleAccess, NewRole } from '../../../src/services/role.service';

// Mock the database config import that's used by the service
jest.mock('../../../src/config/database.config', () => {
  const mockDb = {
    transaction: jest.fn(),
    select: jest.fn(),
    insert: jest.fn(),
    delete: jest.fn(),
  };
  return { db: mockDb };
});

// Import the mocked db
import { db } from '../../../src/config/database.config';

// Mock UUID
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('3fa85f64-5717-4562-b3fc-2c963f66afa6'),
}));

// Valid UUID for tests
const MOCK_UUID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

describe('RoleService', () => {
  let roleService: RoleService;
  const mockDate = new Date('2023-01-01');

  // Test data
  const mockRole = {
    id: MOCK_UUID,
    name: 'Admin Role',
    description: 'Administrator role with full access',
    createdAt: mockDate,
    updatedAt: mockDate,
    isDeleted: false,
    deletedAt: null,
  };

  const mockRoleModuleAccess = [
    {
      id: MOCK_UUID + '1',
      roleId: MOCK_UUID,
      module: 'dashboard',
      accessLevel: 'view_access',
      createdAt: mockDate,
      updatedAt: mockDate,
      isDeleted: false,
      deletedAt: null,
    },
  ];

  const mockRoleWithAccess = {
    ...mockRole,
    moduleAccess: mockRoleModuleAccess,
  };

  const mockModuleAccess: ModuleAccess[] = [
    { module: 'dashboard', accessLevel: 'view_access' },
    { module: 'projects', accessLevel: 'edit_access' },
  ];

  // Create fixed service responses for consistent testing
  const successResponse = {
    success: true,
    data: mockRoleWithAccess,
    error: undefined,
    message: 'Operation successful',
    statusCode: 200,
  };

  const createdResponse = {
    success: true,
    data: mockRoleWithAccess,
    error: undefined,
    message: 'Operation successful',
    statusCode: 201,
  };

  const errorResponse = (message: string, statusCode: number) => ({
    success: false,
    data: undefined,
    error: message,
    message: message,
    statusCode,
  });

  beforeAll(() => {
    setupDatabaseMocks();
  });

  afterAll(async () => {
    await teardownDatabaseMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    resetMocks();

    // Set up Date mock
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    // Get the service instance
    roleService = RoleService.getInstance();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = RoleService.getInstance();
      const instance2 = RoleService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('createRole', () => {
    it('should create a new role with module access successfully', async () => {
      // Arrange
      const newRole: NewRole = {
        name: 'Admin Role',
        description: 'Administrator role with full access',
        moduleAccess: mockModuleAccess,
      };

      // Mock transaction to handle the operation
      const txMock = {
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockRole]),
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockRoleModuleAccess),
      };

      (db.transaction as jest.Mock).mockImplementation(async (callback: any) => {
        return await callback(txMock);
      });

      // Act
      const result = await roleService.createRole(newRole);

      // Assert
      expect(result).toEqual(createdResponse);
      expect(db.transaction).toHaveBeenCalledTimes(1);
      expect(txMock.insert).toHaveBeenCalledTimes(2);
      expect(txMock.values).toHaveBeenCalledTimes(2);
    });

    it('should return an error response when role creation fails', async () => {
      // Arrange
      const newRole: NewRole = {
        name: 'Admin Role',
        description: 'Administrator role with full access',
        moduleAccess: mockModuleAccess,
      };

      // Mock DB transaction failure
      (db.transaction as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Act
      const result = await roleService.createRole(newRole);

      // Assert
      expect(result).toEqual(errorResponse('Database error', StatusCodes.BAD_REQUEST));
    });

    it('should throw an error if no role is returned after creation', async () => {
      // Arrange
      const newRole: NewRole = {
        name: 'Admin Role',
        description: 'Administrator role with full access',
        moduleAccess: mockModuleAccess,
      };

      // Mock DB transaction
      const txMock = {
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]), // Empty array
      };

      (db.transaction as jest.Mock).mockImplementation(async (callback: any) => {
        return await callback(txMock);
      });

      // Act
      const result = await roleService.createRole(newRole);

      // Assert
      expect(result).toEqual(errorResponse('Failed to create role', StatusCodes.BAD_REQUEST));
    });
  });

  describe('getRoleById', () => {
    it('should return a role with module access when found', async () => {
      // Mock db.select chain
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockRole]),
      };

      const mockSelectChain2 = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockRoleModuleAccess),
      };

      (db.select as jest.Mock)
        .mockReturnValueOnce(mockSelectChain)
        .mockReturnValueOnce(mockSelectChain2);

      // Act
      const result = await roleService.getRoleById(MOCK_UUID);

      // Assert
      expect(result).toEqual(successResponse);
      expect(db.select).toHaveBeenCalledTimes(2);
      expect(mockSelectChain.from).toHaveBeenCalledTimes(1);
      expect(mockSelectChain.where).toHaveBeenCalledTimes(1);
    });

    it('should return a not found error when role is not found', async () => {
      // Mock db.select chain
      const mockSelectChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]), // Empty array = not found
      };

      (db.select as jest.Mock).mockReturnValue(mockSelectChain);

      // Act
      const result = await roleService.getRoleById(MOCK_UUID);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('should handle unexpected errors', async () => {
      // Mock db.select to throw an error
      (db.select as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      // Act
      const result = await roleService.getRoleById(MOCK_UUID);

      // Assert
      expect(result).toEqual(errorResponse('Unexpected error', StatusCodes.INTERNAL_SERVER_ERROR));
    });
  });

  describe('getAllRoles', () => {
    it('should return all roles with their module access', async () => {
      // Mock db.select to return roles
      const mockRoles = [mockRole, { ...mockRole, id: MOCK_UUID + '2' }];

      const mockSelectChain = {
        from: jest.fn().mockResolvedValue(mockRoles),
      };

      const mockSelectChain2 = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockRoleModuleAccess),
      };

      (db.select as jest.Mock)
        .mockReturnValueOnce(mockSelectChain)
        .mockReturnValue(mockSelectChain2); // Use mockReturnValue for all subsequent calls

      // Act
      const result = await roleService.getAllRoles();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
      expect(db.select).toHaveBeenCalledTimes(3); // Once for roles, twice for module access
    });

    it('should handle errors when fetching roles', async () => {
      // Mock db.select to throw an error
      (db.select as jest.Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      // Act
      const result = await roleService.getAllRoles();

      // Assert
      expect(result).toEqual(errorResponse('Database error', StatusCodes.INTERNAL_SERVER_ERROR));
    });
  });

  describe('updateRoleModuleAccess', () => {
    it('should update module access for a role successfully', async () => {
      // Arrange
      const updatedModuleAccess: ModuleAccess[] = [
        { module: 'dashboard', accessLevel: 'full_access' },
        { module: 'reports', accessLevel: 'view_access' },
      ];

      // Mock transaction
      const txMock = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockRole]),
        delete: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
      };

      // Mock the second where call to return module access
      txMock.where.mockImplementationOnce(() => ({ limit: txMock.limit }));
      txMock.where.mockResolvedValueOnce(undefined); // For delete

      // Need a separate mock for the final select
      const selectMock = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockRoleModuleAccess),
      };

      txMock.select.mockImplementationOnce(() => txMock); // First select in tx
      txMock.select.mockReturnValueOnce(selectMock); // Second select in tx

      // Set up transaction mock
      (db.transaction as jest.Mock).mockImplementation(async (callback: any) => {
        return await callback(txMock);
      });

      // Act
      const result = await roleService.updateRoleModuleAccess(MOCK_UUID, updatedModuleAccess);

      // Assert
      expect(result).toEqual(successResponse);
      expect(db.transaction).toHaveBeenCalledTimes(1);
      expect(txMock.select).toHaveBeenCalledTimes(2);
      expect(txMock.delete).toHaveBeenCalledTimes(1);
      expect(txMock.insert).toHaveBeenCalledTimes(1);
    });

    it('should return not found error when role does not exist', async () => {
      // Arrange
      const updatedModuleAccess: ModuleAccess[] = [
        { module: 'dashboard', accessLevel: 'full_access' },
      ];

      // Mock transaction
      const txMock = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]), // Empty array = not found
      };

      txMock.where.mockReturnValue({ limit: txMock.limit });

      // Set up transaction mock
      (db.transaction as jest.Mock).mockImplementation(async (callback: any) => {
        try {
          return await callback(txMock);
        } catch (error) {
          throw error;
        }
      });

      // Act
      const result = await roleService.updateRoleModuleAccess(MOCK_UUID, updatedModuleAccess);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('should handle unexpected errors during update', async () => {
      // Arrange
      const updatedModuleAccess: ModuleAccess[] = [
        { module: 'dashboard', accessLevel: 'full_access' },
      ];

      // Mock transaction to throw error
      (db.transaction as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Act
      const result = await roleService.updateRoleModuleAccess(MOCK_UUID, updatedModuleAccess);

      // Assert
      expect(result).toEqual(errorResponse('Database error', StatusCodes.INTERNAL_SERVER_ERROR));
    });
  });
});
