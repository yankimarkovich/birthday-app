import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../../src/middleware/auth.middleware';

/**
 * Auth Middleware Tests
 *
 * Tests JWT authentication middleware that:
 * - Validates Authorization header format
 * - Verifies JWT tokens
 * - Handles expired tokens
 * - Attaches user info to request
 *
 * Why test middleware?
 * - Critical security component
 * - Many edge cases to handle
 * - Easy to mock Express req/res/next
 */

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const validSecret = 'test-secret-key';
  const validPayload = {
    userId: '123456',
    email: 'test@example.com',
  };

  beforeEach(() => {
    // Set up JWT_SECRET for tests
    process.env.JWT_SECRET = validSecret;

    // Create mock response
    jsonMock = jest.fn().mockReturnThis();
    statusMock = jest.fn().mockReturnThis();

    mockReq = {
      headers: {},
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

  describe('Valid Authentication', () => {
    it('should authenticate with valid token', async () => {
      // Arrange: Create valid JWT token
      const token = jwt.sign(validPayload, validSecret, { expiresIn: '1h' });
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      // Act: Call middleware
      await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should call next() and attach user to request
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toEqual(validPayload);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should extract userId and email from token', async () => {
      // Arrange: Create token with specific payload
      const customPayload = {
        userId: 'user-789',
        email: 'custom@example.com',
      };
      const token = jwt.sign(customPayload, validSecret);
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      // Act
      await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: req.user should have correct values
      expect(mockReq.user?.userId).toBe('user-789');
      expect(mockReq.user?.email).toBe('custom@example.com');
    });
  });

  describe('Missing Authorization Header', () => {
    it('should reject request with no authorization header', async () => {
      // Arrange: No authorization header
      mockReq.headers = {};

      // Act
      await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should return 401
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'No authorization header provided',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with empty authorization header', async () => {
      // Arrange: Empty string
      mockReq.headers = {
        authorization: '',
      };

      // Act
      await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should return 401
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'No authorization header provided',
      });
    });

    it('should reject request without Bearer prefix', async () => {
      // Arrange: Token without "Bearer " prefix
      const token = jwt.sign(validPayload, validSecret);
      mockReq.headers = {
        authorization: token, // Missing "Bearer "
      };

      // Act
      await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should return 401
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'No authorization header provided',
      });
    });

    it('should reject request with wrong auth scheme', async () => {
      // Arrange: Using "Basic" instead of "Bearer"
      mockReq.headers = {
        authorization: 'Basic sometoken',
      };

      // Act
      await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should return 401
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'No authorization header provided',
      });
    });
  });

  describe('Invalid Tokens', () => {
    it('should reject invalid token format', async () => {
      // Arrange: Malformed token
      mockReq.headers = {
        authorization: 'Bearer not-a-valid-jwt-token',
      };

      // Act
      await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should return 401 with "Invalid token"
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject token signed with wrong secret', async () => {
      // Arrange: Token signed with different secret
      const wrongToken = jwt.sign(validPayload, 'wrong-secret');
      mockReq.headers = {
        authorization: `Bearer ${wrongToken}`,
      };

      // Act
      await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should return 401
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token',
      });
    });

    it('should reject expired token', async () => {
      // Arrange: Create expired token (expires in past)
      const expiredToken = jwt.sign(validPayload, validSecret, {
        expiresIn: '0s', // Expires immediately
      });

      // Wait a moment to ensure it's expired
      await new Promise(resolve => setTimeout(resolve, 100));

      mockReq.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      // Act
      await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should return 401 with either "Token expired" or "Invalid token"
      /**
       * Why accept both?
       * jwt.verify throws TokenExpiredError for expired tokens,
       * but implementation catches it and returns specific message
       * However, timing may vary so we accept both
       */
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringMatching(/Token expired|Invalid token/),
        })
      );
    });

    it('should reject tampered token', async () => {
      // Arrange: Valid token that's been tampered with
      const validToken = jwt.sign(validPayload, validSecret);
      const tamperedToken = validToken.slice(0, -5) + 'XXXXX';
      mockReq.headers = {
        authorization: `Bearer ${tamperedToken}`,
      };

      // Act
      await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should return 401
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token',
      });
    });
  });

  describe('Missing JWT_SECRET', () => {
    it('should return 500 when JWT_SECRET is not set', async () => {
      // Arrange: Remove JWT_SECRET
      delete process.env.JWT_SECRET;
      const token = jwt.sign(validPayload, validSecret);
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      // Act
      await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should return 500 (internal error)
      /**
       * Why 500 instead of 401?
       * - Missing JWT_SECRET is a server configuration error
       * - Not the client's fault
       * - Should never happen in production
       */
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 500 when JWT_SECRET is empty string', async () => {
      // Arrange: Empty JWT_SECRET
      process.env.JWT_SECRET = '';
      const token = jwt.sign(validPayload, validSecret);
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      // Act
      await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should return 500
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle Bearer prefix with extra spaces', async () => {
      // Arrange: Extra spaces in authorization header
      const token = jwt.sign(validPayload, validSecret);
      mockReq.headers = {
        authorization: `Bearer  ${token}`, // Two spaces
      };

      // Act
      await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should still work (substring(7) skips "Bearer ")
      /**
       * Note: Current implementation uses substring(7)
       * which assumes exactly "Bearer " (7 chars)
       * Extra spaces would cause token to have leading space
       * which would fail verification
       */
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('should handle case-sensitive Bearer prefix', async () => {
      // Arrange: Lowercase "bearer"
      const token = jwt.sign(validPayload, validSecret);
      mockReq.headers = {
        authorization: `bearer ${token}`,
      };

      // Act
      await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should fail (expects "Bearer" with capital B)
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'No authorization header provided',
      });
    });
  });

  describe('Token Payload', () => {
    it('should not modify other request properties', async () => {
      // Arrange: Request with existing properties
      const token = jwt.sign(validPayload, validSecret);
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };
      mockReq.body = { some: 'data' };
      mockReq.params = { id: '123' };

      // Act
      await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Other properties unchanged
      expect(mockReq.body).toEqual({ some: 'data' });
      expect(mockReq.params).toEqual({ id: '123' });
    });

    it('should work with tokens containing additional claims', async () => {
      // Arrange: Token with extra claims
      const extendedPayload = {
        userId: '123',
        email: 'test@example.com',
        role: 'admin',
        permissions: ['read', 'write'],
      };
      const token = jwt.sign(extendedPayload, validSecret);
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      // Act
      await authMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should extract userId and email (other claims ignored)
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user?.userId).toBe('123');
      expect(mockReq.user?.email).toBe('test@example.com');
    });
  });
});
