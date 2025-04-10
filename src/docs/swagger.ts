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
        required: ['id', 'email', 'role', 'isActive', 'createdAt', 'updatedAt'],
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
          role: {
            type: 'string',
            enum: ['admin', 'user'],
            description: 'User role',
          },
          isActive: {
            type: 'boolean',
            description: 'User account status',
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
      Equipment: {
        type: 'object',
        required: ['id', 'equipmentName', 'equipmentType', 'createdAt', 'updatedAt'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Equipment ID',
          },
          equipmentName: {
            type: 'string',
            description: 'Equipment name',
          },
          equipmentType: {
            type: 'string',
            enum: ['compressor', 'pump', 'valve', 'tank', 'vessel', 'pipeline'],
            description: 'Type of equipment',
          },
          locationLatitude: {
            type: 'number',
            format: 'double',
            description: 'Equipment location latitude',
          },
          locationLongitude: {
            type: 'number',
            format: 'double',
            description: 'Equipment location longitude',
          },
          notes: {
            type: 'string',
            description: 'Additional notes about the equipment',
          },
          isDeleted: {
            type: 'boolean',
            description: 'Soft delete status',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      Component: {
        type: 'object',
        required: [
          'id',
          'componentSubType',
          'monitoringFrequency',
          'accessDifficulty',
          'createdAt',
          'updatedAt',
        ],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Component ID',
          },
          componentSubType: {
            type: 'string',
            enum: ['connector', 'flange', 'valve', 'relief', 'threaded', 'other'],
            description: 'Subtype of component',
          },
          monitoringFrequency: {
            type: 'string',
            enum: ['daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'annual'],
            description: 'Frequency of monitoring',
          },
          accessDifficulty: {
            type: 'string',
            enum: ['easy', 'moderate', 'difficult', 'very_difficult'],
            description: 'Difficulty level of accessing the component',
          },
          locationLatitude: {
            type: 'number',
            format: 'double',
            description: 'Component location latitude',
          },
          locationLongitude: {
            type: 'number',
            format: 'double',
            description: 'Component location longitude',
          },
          notes: {
            type: 'string',
            description: 'Additional notes about the component',
          },
          isDeleted: {
            type: 'boolean',
            description: 'Soft delete status',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      Survey: {
        type: 'object',
        required: [
          'id',
          'customerName',
          'projectId',
          'facilityId',
          'zone',
          'regulationId',
          'monitoringFrequency',
          'surveyType',
          'priority',
          'surveyMethod',
          'technology',
          'primaryTechnicianId',
          'date',
          'createdAt',
          'updatedAt',
        ],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Survey ID',
          },
          customerName: {
            type: 'string',
            description: 'Customer name',
          },
          projectId: {
            type: 'string',
            format: 'uuid',
            description: 'Associated project ID',
          },
          facilityId: {
            type: 'string',
            format: 'uuid',
            description: 'Associated facility ID',
          },
          zone: {
            type: 'string',
            enum: ['north', 'south', 'east', 'west', 'central'],
            description: 'Facility zone surveyed',
          },
          regulationId: {
            type: 'string',
            format: 'uuid',
            description: 'Associated regulation ID',
          },
          monitoringFrequency: {
            type: 'string',
            enum: ['daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'annual'],
            description: 'Frequency of monitoring',
          },
          surveyType: {
            type: 'string',
            enum: ['routine', 'follow_up', 'emergency', 'baseline'],
            description: 'Type of survey',
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical'],
            description: 'Priority level of the survey',
          },
          surveyMethod: {
            type: 'string',
            enum: ['visual', 'optical_gas_imaging', 'measurement', 'other'],
            description: 'Method used for the survey',
          },
          technology: {
            type: 'string',
            enum: ['flir_camera', 'tvs2000', 'sniffdog', 'prototype'],
            description: 'Technology used for the survey',
          },
          primaryTechnicianId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the primary technician',
          },
          date: {
            type: 'string',
            format: 'date-time',
            description: 'Date of the survey',
          },
          notes: {
            type: 'string',
            description: 'Additional notes about the survey',
          },
          isDeleted: {
            type: 'boolean',
            description: 'Soft delete status',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      Pending: {
        type: 'object',
        required: ['id', 'title', 'status', 'dueDate', 'assignedToId', 'createdAt', 'updatedAt'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Pending item ID',
          },
          title: {
            type: 'string',
            description: 'Title of the pending item',
          },
          description: {
            type: 'string',
            description: 'Detailed description of the pending item',
          },
          status: {
            type: 'string',
            enum: ['new', 'in_progress', 'blocked', 'completed'],
            description: 'Current status of the pending item',
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical'],
            description: 'Priority level of the pending item',
          },
          dueDate: {
            type: 'string',
            format: 'date-time',
            description: 'Due date for the pending item',
          },
          assignedToId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the user assigned to this pending item',
          },
          relatedItemId: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the related item (equipment, component, or survey)',
          },
          relatedItemType: {
            type: 'string',
            enum: ['equipment', 'component', 'survey'],
            description: 'Type of the related item',
          },
          isDeleted: {
            type: 'boolean',
            description: 'Soft delete status',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
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
    {
      name: 'Equipment',
      description: 'Equipment management endpoints',
    },
    {
      name: 'Components',
      description: 'Component management endpoints',
    },
    {
      name: 'Surveys',
      description: 'Survey management endpoints',
    },
    {
      name: 'Pending',
      description: 'Pending items management endpoints',
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
