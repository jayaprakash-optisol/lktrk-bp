import { formatZodError, createValidator } from '../../../src/utils/validator.util';
import { z } from 'zod';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../../../src/utils/logger';

// Mock dependencies
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('Validator Utils', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatZodError', () => {
    it('should format a simple ZodError correctly', () => {
      // Arrange
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      let zodError: z.ZodError;

      try {
        schema.parse({ name: 123, age: 'twenty' });
      } catch (error) {
        zodError = error as z.ZodError;

        // Act
        const formattedError = formatZodError(zodError);

        // Assert
        expect(formattedError).toContain('name:');
        expect(formattedError).toContain('age:');
        expect(formattedError).toContain('Expected string');
        expect(formattedError).toContain('Expected number');
      }
    });

    it('should format nested ZodErrors correctly', () => {
      // Arrange
      const schema = z.object({
        user: z.object({
          name: z.string(),
          contact: z.object({
            email: z.string().email(),
          }),
        }),
      });

      let zodError: z.ZodError;

      try {
        schema.parse({
          user: {
            name: 123,
            contact: {
              email: 'invalid-email',
            },
          },
        });
      } catch (error) {
        zodError = error as z.ZodError;

        // Act
        const formattedError = formatZodError(zodError);

        // Assert
        expect(formattedError).toContain('user.name:');
        expect(formattedError).toContain('user.contact.email:');
        expect(formattedError).toContain('Expected string');
        expect(formattedError).toContain('Invalid email');
      }
    });
  });

  describe('createValidator', () => {
    // Create mock request, response, and next function
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
      mockRequest = {
        body: {},
        query: {},
        params: {},
        path: '/test',
        method: 'GET',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          roleId: 'role-456',
        },
      };

      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mockNext = jest.fn();
    });

    it('should call next() when validation passes for body', () => {
      // Arrange
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      mockRequest.body = {
        name: 'John',
        age: 30,
      };

      const validator = createValidator(schema, 'body');

      // Act
      validator(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next() when validation passes for query', () => {
      // Arrange
      const schema = z.object({
        page: z.string(),
        limit: z.string(),
      });

      mockRequest.query = {
        page: '1',
        limit: '10',
      };

      const validator = createValidator(schema, 'query');

      // Act
      validator(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next() when validation passes for params', () => {
      // Arrange
      const schema = z.object({
        id: z.string(),
      });

      mockRequest.params = {
        id: '123',
      };

      const validator = createValidator(schema, 'params');

      // Act
      validator(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 400 Bad Request when validation fails', () => {
      // Arrange
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      mockRequest.body = {
        name: 123, // Invalid type
        age: 'thirty', // Invalid type
      };

      const validator = createValidator(schema, 'body');

      // Act
      validator(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: expect.stringContaining('Validation error:'),
      });
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should pass non-ZodError to next middleware', () => {
      // Arrange
      const schema = z.object({
        name: z.string(),
      });

      // Mock schema.parse to throw a non-ZodError
      const originalParse = schema.parse;
      schema.parse = jest.fn().mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const validator = createValidator(schema, 'body');

      // Act
      validator(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();

      // Restore original method
      schema.parse = originalParse;
    });

    it('should default to validating body when source is not specified', () => {
      // Arrange
      const schema = z.object({
        name: z.string(),
      });

      mockRequest.body = {
        name: 'John',
      };

      const validator = createValidator(schema); // No source specified

      // Act
      validator(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should log userId from the request if available', () => {
      // Arrange
      const schema = z.object({
        name: z.string(),
      });

      mockRequest.body = {
        name: 123, // Invalid
      };

      const validator = createValidator(schema);

      // Act
      validator(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(logger.warn).toHaveBeenCalledWith(
        'Validation error in body',
        expect.objectContaining({
          userId: 'user-123',
        }),
      );
    });
  });
});
