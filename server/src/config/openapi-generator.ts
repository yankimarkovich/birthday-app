import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './openapi-registry';

/**
 * Generate OpenAPI 3.0 Specification
 *
 * This function generates the complete OpenAPI spec from our registry.
 * It's auto-generated from Zod schemas, so it's always up-to-date!
 */
export function generateOpenAPISpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Birthday App API',
      version: '1.0.0',
      description: `
# Birthday App REST API

A complete birthday tracking application with user authentication.

## Features
- 🔐 JWT Authentication (Register/Login)
- 🎂 Birthday CRUD operations
- 📅 Filter today's birthdays
- 🎉 Send birthday wishes
- 👤 User-specific data isolation

## Authentication
Most endpoints require a JWT token. To authenticate:
1. Register a new account or login
2. Copy the \`token\` from the response
3. Click "Authorize" button (🔓 icon)
4. Enter: \`Bearer YOUR_TOKEN_HERE\`
5. Click "Authorize"

Now you can test protected endpoints!

## Base URL
- Development: \`http://localhost:5000\`
- Production: \`https://your-domain.com\`
      `.trim(),
      contact: {
        name: 'Yanki',
        email: 'your-email@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.birthday-app.com',
        description: 'Production server (example)',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User registration and login endpoints',
      },
      {
        name: 'Birthdays',
        description: 'CRUD operations for birthdays (protected endpoints)',
      },
      {
        name: 'Health',
        description: 'API health check',
      },
    ],
  });
}
