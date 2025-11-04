import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import authRoutes from './routes/auth.routes';
import birthdayRoutes from './routes/birthday.routes';
import swaggerUi from 'swagger-ui-express';
import { getOpenApiDocument } from './docs/openapi';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/error.middleware';
import { requestIdMiddleware } from './middleware/request-id.middleware';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security and parsing middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Correlation ID middleware (set early)
app.use(requestIdMiddleware);

// Basic API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// OpenAPI docs
const openApiDoc = getOpenApiDocument();
app.get('/openapi.json', (_req, res) => {
  res.json(openApiDoc);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDoc));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/birthdays', birthdayRoutes);

// Centralized error handler
app.use(errorHandler);

// Start server function
const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Health: http://localhost:${PORT}/health`);
      logger.info(`Docs: http://localhost:${PORT}/docs`);
      logger.info(`API base: http://localhost:${PORT}/api`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error as Error);
    process.exit(1);
  }
};

startServer();
