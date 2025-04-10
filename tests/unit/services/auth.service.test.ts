import { AuthService } from '../../../src/services';
import { UserService } from '../../../src/services';
import { RoleService } from '../../../src/services';
import { mockUsers } from '../../mocks/mocks';
import { jwtUtil } from '../../../src/utils/jwt.util';
import { StatusCodes } from 'http-status-codes';
import { ModuleAccess } from '../../../src/services/role.service';

// Fix the UserService mock implementation
jest.mock('../../../src/services/user.service', () => {
  // Create mock instances for the methods
  const getUserByEmail = jest.fn();
  const createUser = jest.fn();
  const verifyPassword = jest.fn();
  const getUserById = jest.fn();

  return {
    UserService: {
      getInstance: jest.fn(() => ({
        getUserByEmail,
        createUser,
        verifyPassword,
        getUserById,
      })),
    },
  };
});

// Mock the RoleService
jest.mock('../../../src/services/role.service', () => {
  const getRoleById = jest.fn();
  const createRole = jest.fn();

  return {
    RoleService: {
      getInstance: jest.fn(() => ({
        getRoleById,
        createRole,
      })),
    },
  };
});

// Fix the JWT mock implementation
jest.mock('../../../src/utils/jwt.util', () => {
  const generateToken = jest.fn(() => 'mock-token');

  return {
    jwtUtil: {
      generateToken,
    },
  };
});

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserService: any;
  let mockRoleService: any;

  beforeEach(() => {
    // Clear mocks
    jest.clearAllMocks();

    // Get instance of service
    authService = AuthService.getInstance();

    // Get mocked services
    mockUserService = UserService.getInstance();
    mockRoleService = RoleService.getInstance();
  });

  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      // Act
      const instance1 = AuthService.getInstance();
      const instance2 = AuthService.getInstance();

      // Assert
      expect(instance1).toBe(instance2);
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'useds1ddr@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '555-123-4567',
        roleId: 'a301bc88-331a-411c-84ce-2c311e628942',
        moduleAccess: [
          { module: 'dashboard', accessLevel: 'no_access' },
          { module: 'projects', accessLevel: 'view_access' },
          { module: 'surveys', accessLevel: 'view_access' },
          { module: 'calendar', accessLevel: 'no_access' },
          { module: 'customers', accessLevel: 'edit_access' },
          { module: 'components', accessLevel: 'no_access' },
          { module: 'equipments', accessLevel: 'no_access' },
        ] as unknown as ModuleAccess[],
      };

      mockUserService.getUserByEmail.mockResolvedValue({
        success: false,
        error: 'User not found',
        statusCode: 404,
      });

      // Mock role validation
      mockRoleService.getRoleById.mockResolvedValue({
        success: true,
        data: { id: 'a301bc88-331a-411c-84ce-2c311e628942', name: 'User' },
      });

      // Mock create role for moduleAccess
      mockRoleService.createRole.mockResolvedValue({
        success: true,
        data: {
          id: 'new-custom-role-id',
          name: 'John Doe Role',
          description: 'Custom role for useds1ddr@example.com',
          moduleAccess: userData.moduleAccess,
        },
      });

      mockUserService.createUser.mockResolvedValue({
        success: true,
        data: {
          id: 3,
          email: userData.email,
          password: 'hashed_password',
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber,
          roleId: 'new-custom-role-id', // Custom role created with moduleAccess
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        statusCode: 201,
      });

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(mockUserService.getUserByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockRoleService.createRole).toHaveBeenCalledWith({
        name: 'John Doe Role',
        description: 'Custom role for useds1ddr@example.com',
        moduleAccess: userData.moduleAccess,
      });
      expect(mockUserService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber,
          roleId: 'new-custom-role-id',
        }),
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(
        expect.objectContaining({
          id: 3,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber,
        }),
      );
      expect(result.data).not.toHaveProperty('password');
    });

    it('should register a user with existing role when no moduleAccess provided', async () => {
      // Arrange
      const userData = {
        email: 'nomodule@example.com',
        password: 'Password123!',
        firstName: 'Regular',
        lastName: 'User',
        phoneNumber: '555-987-6543',
        roleId: 'a301bc88-331a-411c-84ce-2c311e628942',
      };

      mockUserService.getUserByEmail.mockResolvedValue({
        success: false,
        error: 'User not found',
        statusCode: 404,
      });

      // Mock role validation
      mockRoleService.getRoleById.mockResolvedValue({
        success: true,
        data: { id: 'a301bc88-331a-411c-84ce-2c311e628942', name: 'User' },
      });

      mockUserService.createUser.mockResolvedValue({
        success: true,
        data: {
          id: 4,
          email: userData.email,
          password: 'hashed_password',
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber,
          roleId: userData.roleId, // Uses existing role
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        statusCode: 201,
      });

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(mockUserService.getUserByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockRoleService.getRoleById).toHaveBeenCalledWith(userData.roleId);
      expect(mockRoleService.createRole).not.toHaveBeenCalled();
      expect(mockUserService.createUser).toHaveBeenCalledWith(userData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(
        expect.objectContaining({
          id: 4,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber,
          roleId: userData.roleId,
        }),
      );
      expect(result.data).not.toHaveProperty('password');
    });

    it('should return error if email already exists', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '1234567890',
        roleId: 'Admin',
      };

      mockUserService.getUserByEmail.mockResolvedValue({
        success: true,
        data: mockUsers[0],
      });

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(mockUserService.getUserByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserService.createUser).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already in use');
      expect(result.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should handle service errors', async () => {
      // Arrange
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        phoneNumber: '1234567890',
        roleId: 'Admin',
      };

      mockUserService.getUserByEmail.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(mockUserService.getUserByEmail).toHaveBeenCalledWith(userData.email);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';

      mockUserService.verifyPassword.mockResolvedValue({
        success: true,
        data: mockUsers[0],
      });

      // Act
      const result = await authService.login(email, password);

      // Assert
      expect(mockUserService.verifyPassword).toHaveBeenCalledWith(email, password);
      expect(jwtUtil.generateToken).toHaveBeenCalledWith({
        userId: mockUsers[0].id,
        email: mockUsers[0].email,
        roleId: mockUsers[0].roleId,
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        user: mockUsers[0],
        token: 'mock-token',
      });
    });

    it('should return error for invalid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongpassword';

      mockUserService.verifyPassword.mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
        statusCode: 401,
      });

      // Act
      const result = await authService.login(email, password);

      // Assert
      expect(mockUserService.verifyPassword).toHaveBeenCalledWith(email, password);
      expect(jwtUtil.generateToken).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      expect(result.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('should handle service errors', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';

      mockUserService.verifyPassword.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await authService.login(email, password);

      // Assert
      expect(mockUserService.verifyPassword).toHaveBeenCalledWith(email, password);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      // Arrange
      const userId = '9f983688-16f7-4969-9eb9-72eb7acbefa2';

      mockUserService.getUserById.mockResolvedValue({
        success: true,
        data: mockUsers[0],
      });

      // Act
      const result = await authService.refreshToken(userId);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(jwtUtil.generateToken).toHaveBeenCalledWith({
        userId: mockUsers[0].id,
        email: mockUsers[0].email,
        roleId: mockUsers[0].roleId,
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        token: 'mock-token',
      });
    });

    it('should return error if user not found', async () => {
      // Arrange
      const userId = '9f983688-16f7-4969-9eb9-72eb7acbefa3';

      mockUserService.getUserById.mockResolvedValue({
        success: false,
        error: 'User not found',
        statusCode: 404,
      });

      // Act
      const result = await authService.refreshToken(userId);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(jwtUtil.generateToken).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
      expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
    });

    it('should handle service errors', async () => {
      // Arrange
      const userId = '9f983688-16f7-4969-9eb9-72eb7acbefa2';

      mockUserService.getUserById.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await authService.refreshToken(userId);

      // Assert
      expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });
});
