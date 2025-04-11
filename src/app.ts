import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import env from './config/env.config';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import {
  corsOptions,
  contentSecurityPolicy,
  noSniff,
  xssFilter,
  frameGuard,
  hsts,
  cacheControl,
} from './middleware/security.middleware';
import { rateLimiter } from './middleware/rateLimiter.middleware';
import { stream } from './utils/logger';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger';
import routes from './routes';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddleware(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS with custom options
    this.app.use(cors(corsOptions));

    // Additional security headers
    this.app.use(contentSecurityPolicy);
    this.app.use(noSniff);
    this.app.use(xssFilter);
    this.app.use(frameGuard);
    this.app.use(hsts);
    this.app.use(cacheControl);

    // Request parsing
    this.app.use(express.json({ limit: '1mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '1mb' }));

    // Compression
    this.app.use(compression());

    // Logging
    if (env.NODE_ENV === 'production') {
      this.app.use(morgan('combined', { stream }));
    } else {
      // Simple, clean log format for development
      this.app.use(
        morgan(':method :url :status :response-time[0]ms', {
          stream,
          skip: req => req.url === '/health',
        }),
      );
    }
  }

  private configureRoutes(): void {
    // Apply rate limiter to API routes
    this.app.use(`${env.API_PREFIX}`, rateLimiter());

    // Configure web API routes with versioning
    this.app.use(env.API_PREFIX, routes);

    // Health check endpoint (no rate limiting)
    this.app.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({ status: 'OK' });
    });

    // Swagger documentation (no rate limiting)
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Expose Swagger JSON (no rate limiting)
    this.app.get('/api-docs.json', (_req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }

  private configureErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Error handler
    this.app.use(errorHandler);
  }
}

export default new App().app;
