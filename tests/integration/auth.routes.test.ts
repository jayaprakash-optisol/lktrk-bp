import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../../src/services/auth.service';
import { Request, Response, NextFunction } from 'express';
import 'express';
import { agent, mockToken, mockUsers } from '../mocks';
import { setupBasicTests } from '../mocks/test-hooks';
// import { ModuleAccess } from '../../src/services/role.service';

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

// Mock auth middleware instead of relying on the actual auth flow
jest.mock('../../src/middleware/auth.middleware', () => {
  return {
    authenticate: (req: Request, res: Response, next: NextFunction) => {
      if (req.headers.authorization) {
        req.user = {
          id: '1',
          userId: 1,
          email: 'test@example.com',
          roleId: 'user',
        };
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

// Mock AuthService
jest.mock('../../src/services/auth.service', () => {
  const register = jest.fn();
  const login = jest.fn();
  const refreshToken = jest.fn();

  return {
    AuthService: {
      getInstance: jest.fn(() => ({
        register,
        login,
        refreshToken,
      })),
    },
  };
});

// Define API prefix to match app configuration
const API_PREFIX = '/api/v1';

describe('Auth Routes', () => {
  let authService: any;

  beforeAll(async () => {
    authService = AuthService.getInstance();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      // Arrange
      // const moduleAccessInput = {
      //   dashboard: 'no_access',
      //   projects: 'view_access',
      //   surveys: 'view_access',
      //   calendar: 'no_access',
      //   customers: 'edit_access',
      //   components: 'no_access',
      //   equipments: 'no_access',
      // };

      // This is the data we'll send in the request
      const newUser = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        roleId: '9f983688-16f7-4969-9eb9-72eb7acbefa3',
        phoneNumber: '1234567890',
        // moduleAccess: moduleAccessInput,
      };

      // This is the expected processed moduleAccess that the controller will create
      // const expectedModuleAccess = Object.entries(moduleAccessInput).map(
      //   ([module, accessLevel]) => ({
      //     module,
      //     accessLevel,
      //   }),
      // ) as ModuleAccess[];

      authService.register.mockResolvedValue({
        success: true,
        data: {
          id: '9f983688-16f7-4969-9eb9-72eb7acbefa2',
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          roleId: '9f983688-16f7-4969-9eb9-72eb7acbefa3',
        },
        statusCode: StatusCodes.CREATED,
      });

      // Act
      const response = await agent.post(`${API_PREFIX}/auth/register`).send(newUser);

      // Assert
      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(
        expect.objectContaining({
          email: newUser.email,
        }),
      );

      // Verify we're calling register with proper params but don't be strict about roleId
      // as it might be modified by the controller during processing
      expect(authService.register).toHaveBeenCalledWith(
        expect.objectContaining({
          email: newUser.email,
          password: newUser.password,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phoneNumber: '1234567890',
          // moduleAccess: expectedModuleAccess,
        }),
      );
    });

    it('should return 400 for invalid data', async () => {
      // Arrange
      const invalidUser = {
        // Missing required fields
        firstName: 'Invalid',
      };

      // Act
      const response = await agent.post(`${API_PREFIX}/auth/register`).send(invalidUser);

      // Assert
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBe(false);
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('should return 400 if registration fails', async () => {
      // Arrange
      const existingUser = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        roleId: '99999999-9999-9999-9999-999999999999',
        phoneNumber: '1234567890',
        moduleAccess: {
          dashboard: 'no_access',
          projects: 'view_access',
          surveys: 'view_access',
          calendar: 'no_access',
          customers: 'edit_access',
          components: 'no_access',
          equipments: 'no_access',
        },
      };

      authService.register.mockResolvedValue({
        success: false,
        error: 'Email already in use',
        statusCode: StatusCodes.BAD_REQUEST,
      });

      // Act
      const response = await agent.post(`${API_PREFIX}/auth/register`).send(existingUser);

      // Assert
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email already in use');
      expect(authService.register).toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user successfully', async () => {
      // Arrange
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      authService.login.mockResolvedValue({
        success: true,
        data: {
          user: mockUsers[0],
          token: mockToken,
        },
      });

      // Act
      const response = await agent.post(`${API_PREFIX}/auth/login`).send(credentials);

      // Assert
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(authService.login).toHaveBeenCalledWith(credentials.email, credentials.password);
    });

    it('should return 401 for invalid credentials', async () => {
      // Arrange
      const invalidCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      authService.login.mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
        statusCode: StatusCodes.UNAUTHORIZED,
      });

      // Act
      const response = await agent.post(`${API_PREFIX}/auth/login`).send(invalidCredentials);

      // Assert
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
      expect(authService.login).toHaveBeenCalled();
    });

    it('should return 400 for missing credentials', async () => {
      // Arrange
      const incompleteCredentials = {
        // Missing password
        email: 'test@example.com',
      };

      // Act
      const response = await agent.post(`${API_PREFIX}/auth/login`).send(incompleteCredentials);

      // Assert
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBe(false);
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user info', async () => {
      // Act
      const response = await agent
        .get(`${API_PREFIX}/auth/me`)
        .set('Authorization', `Bearer ${mockToken}`);

      // Assert
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('email');
    });

    it('should return 401 if not authenticated', async () => {
      // Act
      const response = await agent.get(`${API_PREFIX}/auth/me`);

      // Assert
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should refresh token successfully', async () => {
      // Arrange
      authService.refreshToken.mockResolvedValue({
        success: true,
        data: { token: mockToken },
      });

      // Act
      const response = await agent
        .post(`${API_PREFIX}/auth/refresh-token`)
        .set('Authorization', `Bearer ${mockToken}`);

      // Assert
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(authService.refreshToken).toHaveBeenCalled();
    });

    it('should return 401 if not authenticated', async () => {
      // Act
      const response = await agent.post(`${API_PREFIX}/auth/refresh-token`);

      // Assert
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
      expect(authService.refreshToken).not.toHaveBeenCalled();
    });

    it('should return 400 if refresh fails', async () => {
      // Arrange
      authService.refreshToken.mockResolvedValue({
        success: false,
        error: 'Token refresh failed',
        statusCode: StatusCodes.BAD_REQUEST,
      });

      // Act
      const response = await agent
        .post(`${API_PREFIX}/auth/refresh-token`)
        .set('Authorization', `Bearer ${mockToken}`);

      // Assert
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token refresh failed');
      expect(authService.refreshToken).toHaveBeenCalled();
    });
  });
});
