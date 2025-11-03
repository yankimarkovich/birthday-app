import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate, validateParams, validateQuery } from '../../src/middleware/validation.middleware';

/**
 * Validation Middleware Tests
 *
 * Tests Zod validation middleware for:
 * - Request body validation (validate)
 * - URL params validation (validateParams)
 * - Query string validation (validateQuery)
 *
 * Why test validation middleware?
 * - Ensures bad data never reaches controllers
 * - Validates error response format
 * - Tests edge cases (missing fields, wrong types)
 */

describe('Validation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Create mock response
    jsonMock = jest.fn().mockReturnThis();
    statusMock = jest.fn().mockReturnThis();

    mockReq = {
      body: {},
      params: {},
      query: {},
    };

    mockRes = {
      status: statusMock,
      json: jsonMock,
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate() - Request Body', () => {
    const userSchema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      age: z.number().min(18).optional(),
    });

    it('should pass validation with valid body', () => {
      // Arrange: Valid request body
      mockReq.body = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      // Act: Apply validation middleware
      const middleware = validate(userSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should call next()
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should pass validation with optional fields', () => {
      // Arrange: Body with optional age field
      mockReq.body = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };

      // Act
      const middleware = validate(userSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject invalid email format', () => {
      // Arrange: Invalid email
      mockReq.body = {
        name: 'John Doe',
        email: 'not-an-email',
      };

      // Act
      const middleware = validate(userSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should return 400 with error details
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Validation error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'email',
              message: expect.stringContaining('Invalid email'),
            }),
          ]),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject missing required field', () => {
      // Arrange: Missing name field
      mockReq.body = {
        email: 'john@example.com',
      };

      // Act
      const middleware = validate(userSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should return 400
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Validation error',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'name',
            }),
          ]),
        })
      );
    });

    it('should reject field that fails validation rule', () => {
      // Arrange: Name too short (min 2 chars)
      mockReq.body = {
        name: 'J',
        email: 'john@example.com',
      };

      // Act
      const middleware = validate(userSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'name',
            }),
          ]),
        })
      );
    });

    it('should reject wrong data type', () => {
      // Arrange: Age is string instead of number
      mockReq.body = {
        name: 'John Doe',
        email: 'john@example.com',
        age: '25', // String instead of number
      };

      // Act
      const middleware = validate(userSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should fail type validation
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'age',
            }),
          ]),
        })
      );
    });

    it('should handle multiple validation errors', () => {
      // Arrange: Multiple invalid fields
      mockReq.body = {
        name: 'J', // Too short
        email: 'invalid-email', // Invalid format
        age: 15, // Below minimum
      };

      // Act
      const middleware = validate(userSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should return all errors
      expect(statusMock).toHaveBeenCalledWith(400);
      const response = jsonMock.mock.calls[0][0];
      expect(response.details.length).toBeGreaterThan(1);
    });

    it('should reject extra unknown fields with strict schema', () => {
      // Arrange: Schema with strict mode
      const strictSchema = z.object({
        name: z.string(),
      }).strict();

      mockReq.body = {
        name: 'John',
        extraField: 'should fail',
      };

      // Act
      const middleware = validate(strictSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should reject unknown field
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should allow extra fields with default schema', () => {
      // Arrange: Non-strict schema (default Zod behavior)
      const defaultSchema = z.object({
        name: z.string(),
      });

      mockReq.body = {
        name: 'John',
        extraField: 'allowed',
      };

      // Act
      const middleware = validate(defaultSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should pass (Zod ignores extra fields by default)
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateParams() - URL Parameters', () => {
    const idSchema = z.object({
      id: z.string().regex(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId format
    });

    it('should pass validation with valid params', () => {
      // Arrange: Valid MongoDB ObjectId
      mockReq.params = {
        id: '507f1f77bcf86cd799439011',
      };

      // Act
      const middleware = validateParams(idSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should reject invalid param format', () => {
      // Arrange: Invalid ObjectId format
      mockReq.params = {
        id: 'not-a-valid-id',
      };

      // Act
      const middleware = validateParams(idSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should return 400
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Invalid parameter',
        })
      );
    });

    it('should reject missing param', () => {
      // Arrange: Missing id param
      mockReq.params = {};

      // Act
      const middleware = validateParams(idSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should validate multiple params', () => {
      // Arrange: Schema with multiple params
      const multiParamSchema = z.object({
        userId: z.string(),
        birthdayId: z.string(),
      });

      mockReq.params = {
        userId: '123',
        birthdayId: '456',
      };

      // Act
      const middleware = validateParams(multiParamSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateQuery() - Query String', () => {
    const querySchema = z.object({
      page: z.string().regex(/^\d+$/).transform(Number),
      limit: z.string().regex(/^\d+$/).transform(Number).optional(),
      sort: z.enum(['asc', 'desc']).optional(),
    });

    it('should pass validation with valid query params', () => {
      // Arrange: Valid query string
      mockReq.query = {
        page: '1',
        limit: '10',
        sort: 'asc',
      };

      // Act
      const middleware = validateQuery(querySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should pass with only required query params', () => {
      // Arrange: Only required param (page)
      mockReq.query = {
        page: '1',
      };

      // Act
      const middleware = validateQuery(querySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject invalid query param value', () => {
      // Arrange: Invalid sort value
      mockReq.query = {
        page: '1',
        sort: 'invalid', // Should be 'asc' or 'desc'
      };

      // Act
      const middleware = validateQuery(querySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Invalid query parameters',
        })
      );
    });

    it('should reject non-numeric page param', () => {
      // Arrange: Page is not a number
      mockReq.query = {
        page: 'abc',
      };

      // Act
      const middleware = validateQuery(querySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should handle missing required query param', () => {
      // Arrange: Missing required page param
      mockReq.query = {
        sort: 'asc',
      };

      // Act
      const middleware = validateQuery(querySchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });

  describe('Error Handling', () => {
    it('should format error details correctly', () => {
      // Arrange: Schema with nested object
      const nestedSchema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
      });

      mockReq.body = {
        user: {
          name: 'John',
          email: 'invalid',
        },
      };

      // Act
      const middleware = validate(nestedSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Error path should be dotted (user.email)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'user.email',
            }),
          ]),
        })
      );
    });

    it('should call next with error for non-Zod errors', () => {
      // Arrange: Schema that throws non-Zod error
      const brokenSchema = z.any().transform(() => {
        throw new Error('Unexpected error');
      });

      mockReq.body = { any: 'data' };

      // Act
      const middleware = validate(brokenSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should call next with error (not handle it)
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe('Schema Reusability', () => {
    it('should work with same schema instance multiple times', () => {
      // Arrange: Reuse same schema
      const schema = z.object({
        name: z.string(),
      });

      const middleware = validate(schema);

      // First request
      mockReq.body = { name: 'John' };
      middleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Reset mocks
      jest.clearAllMocks();

      // Second request
      mockReq.body = { name: 'Jane' };
      middleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });
});
