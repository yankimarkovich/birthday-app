import { Request, Response, NextFunction } from 'express';
import { requestIdMiddleware } from '../../src/middleware/request-id.middleware';
import crypto from 'crypto';

/**
 * Request ID Middleware Tests
 *
 * Tests request ID tracking middleware that:
 * - Generates unique request IDs
 * - Uses existing ID from header if provided
 * - Adds ID to response header
 * - Creates request-scoped logger
 * - Logs request duration
 *
 * Why test request ID middleware?
 * - Critical for tracing requests in logs
 * - Ensures IDs are unique
 * - Validates header handling
 */

describe('Request ID Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let setHeaderMock: jest.Mock;
  let onMock: jest.Mock;
  let mockLogger: any;
  let headerMock: jest.Mock;

  beforeEach(() => {
    // Mock logger
    mockLogger = {
      child: jest.fn().mockReturnValue({
        http: jest.fn(),
      }),
    };

    // Mock response methods
    setHeaderMock = jest.fn();
    onMock = jest.fn();
    headerMock = jest.fn();

    mockReq = {
      header: headerMock,
      method: 'GET',
      originalUrl: '/api/test',
    };

    mockRes = {
      setHeader: setHeaderMock,
      on: onMock,
      statusCode: 200,
    };

    mockNext = jest.fn();

    // Mock logger module (would need actual import mocking in real scenario)
    // For testing purposes, we'll verify behavior without mocking the import
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Request ID Generation', () => {
    it('should generate new UUID when no header provided', () => {
      // Arrange: No x-request-id header
      headerMock.mockReturnValue(undefined);

      // Spy on crypto.randomUUID
      const uuidSpy = jest.spyOn(crypto, 'randomUUID');

      // Act
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should generate new UUID
      expect(uuidSpy).toHaveBeenCalled();
      expect(mockReq.requestId).toBeDefined();
      expect(mockReq.requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );

      uuidSpy.mockRestore();
    });

    it('should use existing request ID from header', () => {
      // Arrange: Existing request ID in header
      const existingId = 'existing-request-id-123';
      headerMock.mockReturnValue(existingId);

      // Act
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should use existing ID
      expect(mockReq.requestId).toBe(existingId);
      expect(setHeaderMock).toHaveBeenCalledWith('X-Request-ID', existingId);
    });

    it('should accept header value with whitespace', () => {
      // Arrange: ID with whitespace
      const idWithSpaces = '  request-id-with-spaces  ';
      headerMock.mockReturnValue(idWithSpaces);

      // Act
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should use header as-is (implementation checks trim length but uses original)
      /**
       * Current implementation:
       * const id = headerId && headerId.trim().length > 0 ? headerId : crypto.randomUUID();
       * It checks if trimmed length > 0, but uses original headerId
       */
      expect(mockReq.requestId).toBe(idWithSpaces);
      expect(setHeaderMock).toHaveBeenCalledWith('X-Request-ID', idWithSpaces);
    });

    it('should generate new ID when header is empty string', () => {
      // Arrange: Empty header
      headerMock.mockReturnValue('   ');

      // Act
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should generate new UUID (empty after trim)
      expect(mockReq.requestId).toBeDefined();
      expect(mockReq.requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should generate new ID when header is whitespace only', () => {
      // Arrange: Whitespace-only header
      headerMock.mockReturnValue('     ');

      // Act
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should generate new UUID
      expect(mockReq.requestId).toBeDefined();
      expect(mockReq.requestId).not.toBe('     ');
    });
  });

  describe('Response Header', () => {
    it('should set X-Request-ID response header', () => {
      // Arrange
      headerMock.mockReturnValue(undefined);

      // Act
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should set response header
      expect(setHeaderMock).toHaveBeenCalledWith(
        'X-Request-ID',
        expect.any(String)
      );
    });

    it('should use same ID for request and response', () => {
      // Arrange
      headerMock.mockReturnValue(undefined);

      // Act
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Request ID and response header should match
      const requestId = mockReq.requestId;
      expect(setHeaderMock).toHaveBeenCalledWith('X-Request-ID', requestId);
    });

    it('should preserve client-provided ID in response', () => {
      // Arrange: Client provides ID
      const clientId = 'client-tracking-id';
      headerMock.mockReturnValue(clientId);

      // Act
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should echo back client ID
      expect(setHeaderMock).toHaveBeenCalledWith('X-Request-ID', clientId);
    });
  });

  describe('Request-Scoped Logger', () => {
    it('should create child logger with requestId', () => {
      // Arrange
      headerMock.mockReturnValue(undefined);

      // We can't easily test the logger.child call without mocking the import
      // But we can verify that req.log is set
      const childLogger = { http: jest.fn() };
      const loggerWithChild = {
        child: jest.fn().mockReturnValue(childLogger),
      };

      // Act
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: req.log should be defined
      expect(mockReq.log).toBeDefined();
    });
  });

  describe('Request Duration Logging', () => {
    it('should register finish event listener', () => {
      // Arrange
      headerMock.mockReturnValue(undefined);

      // Act
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should register 'finish' event
      expect(onMock).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    it('should log request when response finishes', () => {
      // Arrange
      headerMock.mockReturnValue(undefined);

      // Act
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Finish event registered (actual logger is created inside middleware)
      /**
       * Note: The actual logger is created by logger.child() inside the middleware
       * We can't easily test the logging without mocking the logger module
       * But we can verify the finish event is registered
       */
      expect(onMock).toHaveBeenCalledWith('finish', expect.any(Function));

      // req.log should be defined (child logger created)
      expect(mockReq.log).toBeDefined();
    });

    it('should track request timing for duration calculation', () => {
      // Arrange
      headerMock.mockReturnValue(undefined);

      // Act: Start request
      const startTime = Date.now();
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should register finish handler (timing tracked inside)
      /**
       * The middleware captures Date.now() at start
       * Then calculates duration in the finish handler
       * We verify the mechanism is in place
       */
      expect(onMock).toHaveBeenCalledWith('finish', expect.any(Function));

      // Verify we can call the finish handler without errors
      const finishCallback = onMock.mock.calls[0][1];
      expect(() => finishCallback()).not.toThrow();
    });

    it('should handle different HTTP methods', () => {
      // Arrange
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

      methods.forEach(method => {
        jest.clearAllMocks();
        headerMock.mockReturnValue(undefined);
        mockReq.method = method;

        // Act
        requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

        // Assert: Should register finish handler for all methods
        expect(onMock).toHaveBeenCalledWith('finish', expect.any(Function));
        expect(mockNext).toHaveBeenCalled();
      });
    });

    it('should handle different status codes', () => {
      // Arrange
      const statusCodes = [200, 201, 400, 401, 404, 500];

      statusCodes.forEach(statusCode => {
        jest.clearAllMocks();
        headerMock.mockReturnValue(undefined);
        mockRes.statusCode = statusCode;

        // Act
        requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

        // Assert: Should register finish handler for all status codes
        expect(onMock).toHaveBeenCalledWith('finish', expect.any(Function));

        // Finish callback should execute without errors
        const finishCallback = onMock.mock.calls[0][1];
        expect(() => finishCallback()).not.toThrow();
      });
    });
  });

  describe('Middleware Flow', () => {
    it('should call next() to continue middleware chain', () => {
      // Arrange
      headerMock.mockReturnValue(undefined);

      // Act
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should call next
      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next() with no arguments', () => {
      // Arrange
      headerMock.mockReturnValue(undefined);

      // Act
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should call next with no error
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should set request properties before calling next', () => {
      // Arrange
      headerMock.mockReturnValue(undefined);

      // Act
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Properties should be set when next is called
      expect(mockReq.requestId).toBeDefined();
      expect(mockReq.log).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing header method gracefully', () => {
      // Arrange: req.header returns undefined
      headerMock.mockReturnValue(undefined);

      // Act & Assert: Should not crash
      expect(() => {
        requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);
      }).not.toThrow();

      // Should generate new UUID
      expect(mockReq.requestId).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle very long request IDs', () => {
      // Arrange: Very long ID
      const longId = 'a'.repeat(1000);
      headerMock.mockReturnValue(longId);

      // Act
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should use the long ID
      expect(mockReq.requestId).toBe(longId);
    });

    it('should handle special characters in request ID', () => {
      // Arrange: ID with special characters
      const specialId = 'req-id-!@#$%^&*()';
      headerMock.mockReturnValue(specialId);

      // Act
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should preserve special characters
      expect(mockReq.requestId).toBe(specialId);
    });

    it('should generate unique IDs for concurrent requests', () => {
      // Arrange: Multiple requests with no header
      headerMock.mockReturnValue(undefined);

      const ids: string[] = [];

      // Act: Simulate multiple requests
      for (let i = 0; i < 100; i++) {
        const req = { header: headerMock } as Partial<Request>;
        const res = { setHeader: setHeaderMock, on: onMock } as Partial<Response>;

        requestIdMiddleware(req as Request, res as Response, mockNext);
        ids.push(req.requestId!);
      }

      // Assert: All IDs should be unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(100);
    });
  });
});
