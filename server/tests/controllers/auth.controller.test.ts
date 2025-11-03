import request from 'supertest';
import express from 'express';
import { register, login } from '../../src/controllers/auth.controller';
import { User } from '../../src/models/User.model';
import jwt from 'jsonwebtoken';

/**
 * Auth Controller Tests
 *
 * Tests authentication endpoints:
 * - POST /register - User registration
 * - POST /login - User login
 *
 * Testing approach:
 * - Mock User model (no real database)
 * - Use Supertest for HTTP requests
 * - Test success cases and error cases
 * - Verify JWT token generation
 *
 * Why test controllers?
 * - Validates API contract (request/response format)
 * - Tests integration of controller + model
 * - Ensures proper error handling
 */

// Mock the User model
jest.mock('../../src/models/User.model');

// Create Express app for testing
const app = express();
app.use(express.json());
app.post('/register', register);
app.post('/login', login);

describe('Auth Controller', () => {
  const validSecret = 'test-jwt-secret';
  const originalEnv = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = validSecret;
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalEnv;
  });

  describe('POST /register', () => {
    const validRegisterData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123',
    };

    it('should register new user successfully', async () => {
      // Arrange: Mock User.findOne to return null (email not taken)
      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Mock User constructor and save
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: validRegisterData.name,
        email: validRegisterData.email,
        save: jest.fn().mockResolvedValue(true),
      };
      (User as unknown as jest.Mock).mockImplementation(() => mockUser);

      // Act: Make register request
      const response = await request(app)
        .post('/register')
        .send(validRegisterData)
        .expect(201);

      // Assert: Response should include token and user
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toEqual({
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
      });

      // Verify JWT token is valid
      const decoded = jwt.verify(response.body.token, validSecret) as any;
      expect(decoded.userId).toBe(mockUser._id);
      expect(decoded.email).toBe(mockUser.email);
    });

    it('should return 409 when email already exists', async () => {
      // Arrange: Mock User.findOne to return existing user
      (User.findOne as jest.Mock).mockResolvedValue({
        _id: 'existing-user-id',
        email: validRegisterData.email,
      });

      // Act: Attempt to register with existing email
      const response = await request(app)
        .post('/register')
        .send(validRegisterData)
        .expect(409);

      // Assert: Should return error
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email already registered');

      // Verify User.save was NOT called
      expect(User.prototype.save).not.toHaveBeenCalled();
    });

    it('should return 500 when JWT_SECRET is missing', async () => {
      // Arrange: Remove JWT_SECRET
      delete process.env.JWT_SECRET;

      // Mock successful user creation
      (User.findOne as jest.Mock).mockResolvedValue(null);
      const mockUser = {
        _id: '123',
        name: 'John',
        email: 'john@example.com',
        save: jest.fn().mockResolvedValue(true),
      };
      (User as unknown as jest.Mock).mockImplementation(() => mockUser);

      // Act: Attempt to register
      const response = await request(app)
        .post('/register')
        .send(validRegisterData)
        .expect(500);

      // Assert: Should return internal error
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Internal server error');
    });

    it('should handle database errors gracefully', async () => {
      // Arrange: Mock database error
      (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Act: Attempt to register
      const response = await request(app)
        .post('/register')
        .send(validRegisterData)
        .expect(500);

      // Assert: Should return internal error
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Internal server error');
    });

    it('should handle save errors gracefully', async () => {
      // Arrange: Mock save failure
      (User.findOne as jest.Mock).mockResolvedValue(null);
      const mockUser = {
        _id: '123',
        name: 'John',
        email: 'john@example.com',
        save: jest.fn().mockRejectedValue(new Error('Save error')),
      };
      (User as unknown as jest.Mock).mockImplementation(() => mockUser);

      // Act: Attempt to register
      const response = await request(app)
        .post('/register')
        .send(validRegisterData)
        .expect(500);

      // Assert: Should return internal error
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Internal server error');
    });

    it('should generate token with 7 day expiration', async () => {
      // Arrange
      (User.findOne as jest.Mock).mockResolvedValue(null);
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John',
        email: 'john@example.com',
        save: jest.fn().mockResolvedValue(true),
      };
      (User as unknown as jest.Mock).mockImplementation(() => mockUser);

      // Act: Register
      const response = await request(app)
        .post('/register')
        .send(validRegisterData)
        .expect(201);

      // Assert: Token should have 7 day expiration
      const decoded = jwt.verify(response.body.token, validSecret) as any;
      const tokenExp = decoded.exp;
      const tokenIat = decoded.iat;
      const daysDiff = (tokenExp - tokenIat) / (60 * 60 * 24);

      expect(daysDiff).toBeCloseTo(7, 1);
    });
  });

  describe('POST /login', () => {
    const validLoginData = {
      email: 'john@example.com',
      password: 'SecurePass123',
    };

    it('should login successfully with correct credentials', async () => {
      // Arrange: Mock user with correct password
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'John Doe',
        email: validLoginData.email,
        password: 'hashed-password',
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      // Act: Login request
      const response = await request(app)
        .post('/login')
        .send(validLoginData)
        .expect(200);

      // Assert: Should return token and user
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toEqual({
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
      });

      // Verify token
      const decoded = jwt.verify(response.body.token, validSecret) as any;
      expect(decoded.userId).toBe(mockUser._id);
      expect(decoded.email).toBe(mockUser.email);
    });

    it('should return 401 when user not found', async () => {
      // Arrange: Mock user not found
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      // Act: Login with non-existent email
      const response = await request(app)
        .post('/login')
        .send(validLoginData)
        .expect(401);

      // Assert: Should return invalid credentials
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 401 when password is incorrect', async () => {
      // Arrange: Mock user with wrong password
      const mockUser = {
        _id: '123',
        email: validLoginData.email,
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      // Act: Login with wrong password
      const response = await request(app)
        .post('/login')
        .send(validLoginData)
        .expect(401);

      // Assert: Should return invalid credentials
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');

      // Verify comparePassword was called
      expect(mockUser.comparePassword).toHaveBeenCalledWith(validLoginData.password);
    });

    it('should return 500 when JWT_SECRET is missing', async () => {
      // Arrange: Remove JWT_SECRET
      delete process.env.JWT_SECRET;

      // Mock successful authentication
      const mockUser = {
        _id: '123',
        email: validLoginData.email,
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      // Act: Attempt to login
      const response = await request(app)
        .post('/login')
        .send(validLoginData)
        .expect(500);

      // Assert: Should return internal error
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Internal server error');
    });

    it('should handle database errors gracefully', async () => {
      // Arrange: Mock database error
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      // Act: Attempt to login
      const response = await request(app)
        .post('/login')
        .send(validLoginData)
        .expect(500);

      // Assert: Should return internal error
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Internal server error');
    });

    it('should select password field explicitly', async () => {
      // Arrange
      const selectMock = jest.fn().mockResolvedValue({
        _id: '123',
        email: validLoginData.email,
        comparePassword: jest.fn().mockResolvedValue(true),
      });
      (User.findOne as jest.Mock).mockReturnValue({ select: selectMock });

      // Act: Login
      await request(app)
        .post('/login')
        .send(validLoginData)
        .expect(200);

      // Assert: Should call select with '+password'
      /**
       * Why important?
       * User model has password: { select: false }
       * Must explicitly select password for comparison
       */
      expect(selectMock).toHaveBeenCalledWith('+password');
    });

    it('should not expose password in response', async () => {
      // Arrange
      const mockUser = {
        _id: '123',
        name: 'John',
        email: validLoginData.email,
        password: 'hashed-password',
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      // Act: Login
      const response = await request(app)
        .post('/login')
        .send(validLoginData)
        .expect(200);

      // Assert: Response should NOT include password
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.user).toEqual({
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
      });
    });
  });

  describe('Response Format', () => {
    it('should always return JSON with success field', async () => {
      // Arrange
      (User.findOne as jest.Mock).mockResolvedValue(null);
      const mockUser = {
        _id: '123',
        name: 'John',
        email: 'john@example.com',
        save: jest.fn().mockResolvedValue(true),
      };
      (User as unknown as jest.Mock).mockImplementation(() => mockUser);

      // Act: Register
      const response = await request(app)
        .post('/register')
        .send({
          name: 'John',
          email: 'john@example.com',
          password: 'Pass123',
        });

      // Assert: Should be JSON
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toHaveProperty('success');
    });

    it('should include error message in error responses', async () => {
      // Arrange: Mock existing user
      (User.findOne as jest.Mock).mockResolvedValue({ email: 'exists@example.com' });

      // Act: Register with existing email
      const response = await request(app)
        .post('/register')
        .send({
          name: 'John',
          email: 'exists@example.com',
          password: 'Pass123',
        });

      // Assert: Should include error message
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(typeof response.body.error).toBe('string');
    });
  });
});
