import { StatusCodes } from 'http-status-codes';
import { agent, mockUsers, mockToken } from '../mocks';
import { UserService } from '../../src/services';
import { Request, Response, NextFunction } from 'express';
import { setupBasicTests } from '../mocks/test-hooks';
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

// Mock UserService
jest.mock('../../src/services/user.service', () => {
  const getAllUsers = jest.fn();
  const getUserById = jest.fn();
  const updateUser = jest.fn();
  const deleteUser = jest.fn();

  return {
    UserService: {
      getInstance: jest.fn(() => ({
        getAllUsers,
        getUserById,
        updateUser,
        deleteUser,
      })),
    },
  };
});

// Convert dates to strings to match JSON serialization in API responses
const serializedMockUsers = mockUsers.map(user => ({
  ...user,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
}));

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

describe('User Routes', () => {
  let userService: any;

  beforeAll(() => {
    userService = UserService.getInstance();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return all users with pagination', async () => {
      // Arrange
      userService.getAllUsers.mockResolvedValue({
        success: true,
        data: {
          items: serializedMockUsers,
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
        statusCode: StatusCodes.OK,
      });

      // Act
      const response = await agent
        .get(`${API_PREFIX}/users`)
        .set('Authorization', `Bearer ${mockToken}`)
        .set('x-role', 'admin');

      // Assert
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data.items.length).toBe(2);
      expect(userService.getAllUsers).toHaveBeenCalled();
    });

    it('should return 401 if not authenticated', async () => {
      // Act
      const response = await agent.get(`${API_PREFIX}/users`);
      // Assert
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
      expect(userService.getAllUsers).not.toHaveBeenCalled();
    });

    it('should apply pagination parameters', async () => {
      // Arrange
      userService.getAllUsers.mockResolvedValue({
        success: true,
        data: {
          items: [serializedMockUsers[0]],
          total: 2,
          page: 2,
          limit: 1,
          totalPages: 2,
        },
        statusCode: StatusCodes.OK,
      });

      // Act
      const response = await agent
        .get(`${API_PREFIX}/users?page=2&limit=1`)
        .set('Authorization', `Bearer ${mockToken}`)
        .set('x-role', 'admin');

      // Assert
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.data.page).toBe(2);
      expect(response.body.data.limit).toBe(1);
      expect(userService.getAllUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 1,
        }),
      );
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a user by id', async () => {
      // Arrange
      userService.getUserById.mockResolvedValue({
        success: true,
        data: serializedMockUsers[0],
        statusCode: StatusCodes.OK,
      });

      // Act
      const response = await agent
        .get(`${API_PREFIX}/users/9f983688-16f7-4969-9eb9-72eb7acbefa2`)
        .set('Authorization', `Bearer ${mockToken}`)
        .set('x-role', 'admin');

      // Assert
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(serializedMockUsers[0]);
      expect(userService.getUserById).toHaveBeenCalledWith('9f983688-16f7-4969-9eb9-72eb7acbefa2');
    });
  });
});
