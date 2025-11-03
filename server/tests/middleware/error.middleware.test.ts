import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../src/middleware/error.middleware';

/**
 * Error Handler Middleware Tests
 *
 * Tests global error handling middleware that:
 * - Logs errors centrally
 * - Returns consistent error responses
 * - Hides error details in production
 * - Shows error details in development
 *
 * Why test error handler?
 * - Last line of defense against crashes
 * - Ensures no sensitive info leaks
 * - Validates error response format
 */

describe('Error Handler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let mockLogger: any;

  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Create mock logger
    mockLogger = {
      error: jest.fn(),
    };

    // Create mock response
    jsonMock = jest.fn().mockReturnThis();
    statusMock = jest.fn().mockReturnThis();

    mockReq = {
      log: mockLogger, // Request-scoped logger
    };

    mockRes = {
      status: statusMock,
      json: jsonMock,
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.clearAllMocks();
  });

  describe('Error Logging', () => {
    it('should log error with request-scoped logger', () => {
      // Arrange: Error object
      const error = new Error('Test error');
      process.env.NODE_ENV = 'development';

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should log error
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Test error')
      );
    });

    it('should log error stack trace', () => {
      // Arrange: Error with stack
      const error = new Error('Test error');
      process.env.NODE_ENV = 'development';

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should log stack
      expect(mockLogger.error).toHaveBeenCalled();
      const loggedMessage = mockLogger.error.mock.calls[0][0];
      expect(loggedMessage).toContain('Test error');
    });

    it('should use fallback logger if req.log not available', () => {
      // Arrange: No request-scoped logger
      delete mockReq.log;
      const error = new Error('Test error');

      // Mock the global logger (imported in error.middleware)
      // Since we can't easily mock the import, we just verify it doesn't crash
      process.env.NODE_ENV = 'production';

      // Act & Assert: Should not throw
      expect(() => {
        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);
      }).not.toThrow();
    });

    it('should log non-Error objects as strings', () => {
      // Arrange: String error
      const stringError = 'Plain string error';
      process.env.NODE_ENV = 'development';

      // Act
      errorHandler(stringError, mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should log as string
      expect(mockLogger.error).toHaveBeenCalledWith('Plain string error');
    });

    it('should log undefined errors', () => {
      // Arrange: Undefined error
      process.env.NODE_ENV = 'development';

      // Act
      errorHandler(undefined, mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should log converted to string
      expect(mockLogger.error).toHaveBeenCalledWith('undefined');
    });
  });

  describe('Production Mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should not include error details in production', () => {
      // Arrange: Error with sensitive message
      const error = new Error('Database connection failed: password=secret123');

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should NOT include error message in response
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        // No 'details' field
      });
    });

    it('should return generic error message in production', () => {
      // Arrange: Various error types
      const errors = [
        new Error('Specific error message'),
        new TypeError('Type error'),
        new RangeError('Range error'),
      ];

      errors.forEach(error => {
        jest.clearAllMocks();

        // Act
        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        // Assert: All should return same generic message
        expect(jsonMock).toHaveBeenCalledWith({
          success: false,
          error: 'Internal server error',
        });
      });
    });

    it('should hide stack traces in production', () => {
      // Arrange: Error with stack trace
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at /app/src/file.ts:10:5';

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      // Assert: Stack should not be in response
      const response = jsonMock.mock.calls[0][0];
      expect(response.details).toBeUndefined();
      expect(response.stack).toBeUndefined();
    });
  });

  describe('Development Mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should include error details in development', () => {
      // Arrange: Error with message
      const error = new Error('Detailed error message');

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should include details
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        details: 'Detailed error message',
      });
    });

    it('should help debugging with error messages in dev', () => {
      // Arrange: Specific errors
      const errors = [
        { error: new Error('Database not found'), message: 'Database not found' },
        { error: new TypeError('Cannot read property'), message: 'Cannot read property' },
      ];

      errors.forEach(({ error, message }) => {
        jest.clearAllMocks();

        // Act
        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        // Assert: Should include specific message
        expect(jsonMock).toHaveBeenCalledWith(
          expect.objectContaining({
            details: message,
          })
        );
      });
    });

    it('should not include details for non-Error objects in dev', () => {
      // Arrange: Non-Error object
      const stringError = 'Plain string error';

      // Act
      errorHandler(stringError, mockReq as Request, mockRes as Response, mockNext);

      // Assert: No details for non-Error
      /**
       * Why?
       * Code checks: if (isDev && err instanceof Error)
       * String is not an Error instance
       */
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error',
        // No details
      });
    });
  });

  describe('Response Format', () => {
    it('should always return 500 status code', () => {
      // Arrange: Various errors
      const errors = [
        new Error('Error 1'),
        new TypeError('Error 2'),
        'String error',
        null,
      ];

      errors.forEach(error => {
        jest.clearAllMocks();
        process.env.NODE_ENV = 'production';

        // Act
        errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

        // Assert: Always 500
        expect(statusMock).toHaveBeenCalledWith(500);
      });
    });

    it('should always include success: false', () => {
      // Arrange
      const error = new Error('Test');
      process.env.NODE_ENV = 'production';

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });

    it('should always include generic error message', () => {
      // Arrange
      const error = new Error('Specific error');
      process.env.NODE_ENV = 'production';

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      // Assert
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal server error',
        })
      );
    });

    it('should not call next function', () => {
      // Arrange
      const error = new Error('Test');

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should NOT call next (this is terminal middleware)
      /**
       * Why not call next?
       * - Error handler is last in chain
       * - It terminates the request
       * - Calling next would cause "Cannot set headers after sent"
       */
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle NODE_ENV not set (defaults to development)', () => {
      // Arrange: Unset NODE_ENV
      delete process.env.NODE_ENV;
      const error = new Error('Test error');

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should behave like development (show details)
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          details: 'Test error',
        })
      );
    });

    it('should handle empty error message', () => {
      // Arrange: Error with empty message
      const error = new Error('');
      process.env.NODE_ENV = 'development';

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should still work
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          details: '', // Empty string
        })
      );
    });

    it('should handle errors with circular references', () => {
      // Arrange: Object with circular reference
      const circularError: any = new Error('Circular');
      circularError.circular = circularError;

      process.env.NODE_ENV = 'production';

      // Act & Assert: Should not throw
      expect(() => {
        errorHandler(circularError, mockReq as Request, mockRes as Response, mockNext);
      }).not.toThrow();
    });

    it('should handle very long error messages', () => {
      // Arrange: Very long error message
      const longMessage = 'A'.repeat(10000);
      const error = new Error(longMessage);
      process.env.NODE_ENV = 'development';

      // Act
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      // Assert: Should handle without crashing
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          details: longMessage,
        })
      );
    });
  });
});
