import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

/**
 * OpenAPI Registry
 *
 * This registry collects all our Zod schemas and converts them to OpenAPI format.
 * We'll register schemas here and use them to generate the OpenAPI spec.
 */
export const registry = new OpenAPIRegistry();

/**
 * Register a Bearer Auth security scheme
 * This tells OpenAPI that protected endpoints require a JWT token
 */
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Enter your JWT token from login response',
});
