import swaggerJSDoc from 'swagger-jsdoc';
import { version } from '../../package.json';
import env from '../config/env.config';

/**
 * Base definitions for API documentation
 */
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
    version,
    description: 'API documentation for the application',
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
    contact: {
      name: 'Dev',
      url: 'https:/localhost.com',
      email: 'support@localhost.com',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
      description: 'Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        required: ['id', 'email', 'roleId', 'firstName', 'lastName', 'createdAt', 'updatedAt'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'User ID',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email',
          },
          firstName: {
            type: 'string',
            description: 'User first name',
          },
          lastName: {
            type: 'string',
            description: 'User last name',
          },
          roleId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the user role',
          },
          phoneNumber: {
            type: 'string',
            description: 'User phone number',
          },
          isDeleted: {
            type: 'boolean',
            description: 'User deletion status',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'User creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'User last update timestamp',
          },
        },
      },
      Role: {
        type: 'object',
        required: ['id', 'name', 'createdAt', 'updatedAt'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Role ID',
          },
          name: {
            type: 'string',
            description: 'Role name',
          },
          description: {
            type: 'string',
            description: 'Role description',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Role creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Role last update timestamp',
          },
          isDeleted: {
            type: 'boolean',
            description: 'Role deletion status',
          },
        },
      },
      ModuleAccess: {
        type: 'object',
        required: ['module', 'accessLevel'],
        properties: {
          module: {
            type: 'string',
            enum: [
              'dashboard',
              'projects',
              'surveys',
              'calendar',
              'customers',
              'components',
              'equipments',
              'facility',
              'roles',
              'reports',
            ],
            description: 'Module name',
          },
          accessLevel: {
            type: 'string',
            enum: ['no_access', 'view_access', 'edit_access', 'full_access'],
            description: 'Access level for the module',
          },
        },
      },
      RoleWithAccess: {
        allOf: [
          { $ref: '#/components/schemas/Role' },
          {
            type: 'object',
            properties: {
              moduleAccess: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/ModuleAccess',
                },
                description: 'Module access permissions',
              },
            },
          },
        ],
      },
      Error: {
        type: 'object',
        required: ['success', 'error'],
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'string',
            example: 'Error message',
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication information is missing or invalid',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'Unauthorized',
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Insufficient privileges',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'Insufficient permissions to access this resource',
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'Resource not found',
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error:
                'email: Invalid email format, password: Password must be at least 6 characters',
            },
          },
        },
      },
      ServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'Internal server error',
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Auth',
      description: 'Authentication endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
  ],
};

/**
 * Options for the swagger docs
 */
const options = {
  swaggerDefinition,
  apis: ['./src/docs/index.yaml', './src/docs/routes/**/*.yaml'],
};

/**
 * Initialize swagger-jsdoc
 */
const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
