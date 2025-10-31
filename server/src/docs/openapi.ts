import { z } from 'zod';
import { registry } from '../config/openapi-registry';
import { generateOpenAPISpec } from '../config/openapi-generator';

// Auth schemas
import {
  registerSchema,
  loginSchema,
  authResponseSchema,
  errorResponseSchema,
  userSchema,
} from '../schemas/auth.schema';

// Birthday schemas
import {
  createBirthdaySchema,
  updateBirthdaySchema,
  mongoIdSchema,
  birthdaysListResponseSchema,
  singleBirthdayResponseSchema,
  deleteBirthdayResponseSchema,
  sendWishResponseSchema,
} from '../schemas/birthday.schema';

// Register component schemas with readable names
registry.register('User', userSchema);
registry.register('AuthResponse', authResponseSchema);
registry.register('ErrorResponse', errorResponseSchema);

registry.register('CreateBirthdayInput', createBirthdaySchema);
registry.register('UpdateBirthdayInput', updateBirthdaySchema);
registry.register('MongoIdParam', mongoIdSchema);
registry.register('BirthdaysListResponse', birthdaysListResponseSchema);
registry.register('SingleBirthdayResponse', singleBirthdayResponseSchema);
registry.register('DeleteBirthdayResponse', deleteBirthdayResponseSchema);
registry.register('SendWishResponse', sendWishResponseSchema);

// Health endpoint
registry.registerPath({
  method: 'get',
  path: '/health',
  tags: ['Health'],
  responses: {
    200: {
      description: 'API is healthy',
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal('ok'),
            timestamp: z.string(),
            uptime: z.number(),
          }),
        },
      },
    },
  },
});

// Authentication endpoints
registry.registerPath({
  method: 'post',
  path: '/api/auth/register',
  tags: ['Authentication'],
  request: {
    body: {
      content: {
        'application/json': { schema: registerSchema },
      },
    },
  },
  responses: {
    201: { description: 'Registration successful', content: { 'application/json': { schema: authResponseSchema } } },
    400: { description: 'Validation error', content: { 'application/json': { schema: errorResponseSchema } } },
    409: { description: 'Email already registered', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/auth/login',
  tags: ['Authentication'],
  request: {
    body: {
      content: {
        'application/json': { schema: loginSchema },
      },
    },
  },
  responses: {
    200: { description: 'Login successful', content: { 'application/json': { schema: authResponseSchema } } },
    400: { description: 'Validation error', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Invalid credentials', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

// Birthdays endpoints
registry.registerPath({
  method: 'get',
  path: '/api/birthdays',
  tags: ['Birthdays'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: 'List of birthdays for current user', content: { 'application/json': { schema: birthdaysListResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/birthdays',
  tags: ['Birthdays'],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': { schema: createBirthdaySchema },
      },
    },
  },
  responses: {
    201: { description: 'Birthday created', content: { 'application/json': { schema: singleBirthdayResponseSchema } } },
    400: { description: 'Validation error', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/birthdays/{id}',
  tags: ['Birthdays'],
  security: [{ bearerAuth: [] }],
  request: { params: mongoIdSchema },
  responses: {
    200: { description: 'Birthday by id', content: { 'application/json': { schema: singleBirthdayResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/birthdays/{id}',
  tags: ['Birthdays'],
  security: [{ bearerAuth: [] }],
  request: {
    params: mongoIdSchema,
    body: {
      content: {
        'application/json': { schema: updateBirthdaySchema },
      },
    },
  },
  responses: {
    200: { description: 'Birthday updated', content: { 'application/json': { schema: singleBirthdayResponseSchema } } },
    400: { description: 'Validation error', content: { 'application/json': { schema: errorResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/birthdays/{id}',
  tags: ['Birthdays'],
  security: [{ bearerAuth: [] }],
  request: { params: mongoIdSchema },
  responses: {
    200: { description: 'Birthday deleted', content: { 'application/json': { schema: deleteBirthdayResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

// Birthdays: send wish
registry.registerPath({
  method: 'post',
  path: '/api/birthdays/{id}/wish',
  tags: ['Birthdays'],
  security: [{ bearerAuth: [] }],
  request: { params: mongoIdSchema },
  responses: {
    200: { description: 'Wish logged', content: { 'application/json': { schema: sendWishResponseSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorResponseSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorResponseSchema } } },
  },
});

export function getOpenApiDocument() {
  return generateOpenAPISpec();
}
