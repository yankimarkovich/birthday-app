import request from 'supertest';
import express from 'express';
import {
  createBirthday,
  getBirthdays,
  getTodaysBirthdays,
  getThisMonthsBirthdays,
  getBirthdayById,
  updateBirthday,
  deleteBirthday,
  sendBirthdayWish,
} from '../../src/controllers/birthday.controller';
import { Birthday } from '../../src/models/Birthday.model';

/**
 * Birthday Controller Tests
 *
 * Tests all birthday CRUD endpoints + special features:
 * - POST /birthdays - Create birthday
 * - GET /birthdays - Get all birthdays
 * - GET /birthdays/today - Get today's birthdays
 * - GET /birthdays/this-month - Get this month's birthdays
 * - GET /birthdays/:id - Get specific birthday
 * - PUT /birthdays/:id - Update birthday
 * - DELETE /birthdays/:id - Delete birthday
 * - POST /birthdays/:id/wish - Send birthday wish
 *
 * Testing approach:
 * - Mock Birthday model (no real database)
 * - Mock req.user (simulating authenticated user)
 * - Test authorization, validation, and business logic
 */

// Mock the Birthday model
jest.mock('../../src/models/Birthday.model');

// Middleware to attach mock user to request
const attachMockUser = (req: any, res: any, next: any) => {
  req.user = {
    userId: 'user-123',
    email: 'test@example.com',
  };
  next();
};

// Middleware to remove user (simulate unauthorized)
const removeUser = (req: any, res: any, next: any) => {
  req.user = undefined;
  next();
};

// Create Express app for testing
const app = express();
app.use(express.json());

// Routes with auth
app.post('/birthdays', attachMockUser, createBirthday);
app.get('/birthdays', attachMockUser, getBirthdays);
app.get('/birthdays/today', attachMockUser, getTodaysBirthdays);
app.get('/birthdays/this-month', attachMockUser, getThisMonthsBirthdays);
app.get('/birthdays/:id', attachMockUser, getBirthdayById);
app.put('/birthdays/:id', attachMockUser, updateBirthday);
app.delete('/birthdays/:id', attachMockUser, deleteBirthday);
app.post('/birthdays/:id/wish', attachMockUser, sendBirthdayWish);

describe('Birthday Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /birthdays - Create Birthday', () => {
    const validBirthdayData = {
      name: 'John Doe',
      date: '1990-05-15',
      email: 'john@example.com',
      phone: '555-1234',
      notes: 'Loves chocolate cake',
    };

    it('should create birthday successfully', async () => {
      // Arrange: Mock Birthday save
      const mockBirthday = {
        _id: 'birthday-123',
        userId: 'user-123',
        ...validBirthdayData,
        save: jest.fn().mockResolvedValue(true),
      };
      (Birthday as unknown as jest.Mock).mockImplementation(() => mockBirthday);

      // Act: Create birthday
      const response = await request(app).post('/birthdays').send(validBirthdayData).expect(201);

      // Assert: Response should include created birthday
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(mockBirthday.save).toHaveBeenCalled();
    });

    it('should require authentication', async () => {
      // Arrange: Create app without auth middleware
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.post('/birthdays', removeUser, createBirthday);

      // Act: Try to create without auth
      const response = await request(unauthApp)
        .post('/birthdays')
        .send(validBirthdayData)
        .expect(401);

      // Assert: Should return unauthorized
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should associate birthday with authenticated user', async () => {
      // Arrange
      let capturedUserId: string | undefined;
      (Birthday as unknown as jest.Mock).mockImplementation((data: any) => {
        capturedUserId = data.userId;
        return {
          ...data,
          save: jest.fn().mockResolvedValue(true),
        };
      });

      // Act: Create birthday
      await request(app).post('/birthdays').send(validBirthdayData).expect(201);

      // Assert: Should use authenticated user's ID
      expect(capturedUserId).toBe('user-123');
    });

    it('should handle save errors gracefully', async () => {
      // Arrange: Mock save error
      const mockBirthday = {
        save: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      (Birthday as unknown as jest.Mock).mockImplementation(() => mockBirthday);

      // Act: Attempt to create
      const response = await request(app).post('/birthdays').send(validBirthdayData).expect(500);

      // Assert: Should return internal error
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Internal server error');
    });

    it('should create birthday with minimal data (only required fields)', async () => {
      // Arrange: Only required fields
      const minimalData = {
        name: 'Jane Doe',
        date: '1995-03-20',
      };

      const mockBirthday = {
        ...minimalData,
        save: jest.fn().mockResolvedValue(true),
      };
      (Birthday as unknown as jest.Mock).mockImplementation(() => mockBirthday);

      // Act: Create with minimal data
      const response = await request(app).post('/birthdays').send(minimalData).expect(201);

      // Assert: Should succeed
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /birthdays - Get All Birthdays', () => {
    it('should return all birthdays for authenticated user', async () => {
      // Arrange: Mock birthdays
      const mockBirthdays = [
        { _id: '1', name: 'Person 1', date: new Date('1990-01-15') },
        { _id: '2', name: 'Person 2', date: new Date('1995-06-20') },
      ];

      (Birthday.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockBirthdays),
      });

      // Act: Get birthdays
      const response = await request(app).get('/birthdays').expect(200);

      // Assert: Should return birthdays
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);

      // Verify filtered by userId
      expect(Birthday.find).toHaveBeenCalledWith({ userId: 'user-123' });
    });

    it('should return empty array when no birthdays exist', async () => {
      // Arrange: Mock empty result
      (Birthday.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      // Act: Get birthdays
      const response = await request(app).get('/birthdays').expect(200);

      // Assert: Should return empty array
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });

    it('should require authentication', async () => {
      // Arrange: Create app without auth middleware
      const unauthApp = express();
      unauthApp.use(express.json());
      unauthApp.get('/birthdays', removeUser, getBirthdays);

      // Act: Try without auth
      const response = await request(unauthApp).get('/birthdays').expect(401);

      // Assert: Should return unauthorized
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should sort birthdays by date', async () => {
      // Arrange
      const sortMock = jest.fn().mockResolvedValue([]);
      (Birthday.find as jest.Mock).mockReturnValue({ sort: sortMock });

      // Act: Get birthdays
      await request(app).get('/birthdays').expect(200);

      // Assert: Should sort by date ascending
      expect(sortMock).toHaveBeenCalledWith({ date: 1 });
    });

    it('should handle database errors gracefully', async () => {
      // Arrange: Mock error
      (Birthday.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      // Act: Get birthdays
      const response = await request(app).get('/birthdays').expect(500);

      // Assert: Should return internal error
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe("GET /birthdays/today - Get Today's Birthdays", () => {
    it("should return birthdays matching today's date", async () => {
      // Arrange: Mock birthdays for today
      const today = new Date();
      const mockBirthdays = [{ _id: '1', name: 'Birthday Today', date: today }];

      (Birthday.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockBirthdays),
      });

      // Act: Get today's birthdays
      const response = await request(app).get('/birthdays/today').expect(200);

      // Assert: Should return today's birthdays
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data).toHaveLength(1);

      // Verify query filters by month and day
      const findCall = (Birthday.find as jest.Mock).mock.calls[0][0];
      expect(findCall.userId).toBe('user-123');
      expect(findCall.$expr).toBeDefined();
    });

    it('should filter by month and day only (ignore year)', async () => {
      // Arrange
      (Birthday.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      // Act: Get today's birthdays
      await request(app).get('/birthdays/today').expect(200);

      // Assert: Query should use $month and $dayOfMonth operators
      const findCall = (Birthday.find as jest.Mock).mock.calls[0][0];
      expect(findCall.$expr.$and).toBeDefined();
      expect(findCall.$expr.$and).toHaveLength(2);
    });

    it('should require authentication', async () => {
      // Arrange
      const appUnauth = express();
      appUnauth.use(express.json());
      appUnauth.get('/birthdays/today', removeUser, getTodaysBirthdays);

      // Act: Try without auth
      const response = await request(appUnauth).get('/birthdays/today').expect(401);

      // Assert: Should return unauthorized
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /birthdays/this-month - Get This Month's Birthdays", () => {
    it('should return birthdays in current month', async () => {
      // Arrange: Mock birthdays for this month
      const mockBirthdays = [
        { _id: '1', name: 'Birthday 1', date: new Date(), userId: 'user-123' },
        { _id: '2', name: 'Birthday 2', date: new Date(), userId: 'user-123' },
      ];

      (Birthday.find as jest.Mock).mockResolvedValue(mockBirthdays);

      // Act: Get this month's birthdays
      const response = await request(app).get('/birthdays/this-month').expect(200);

      // Assert: Should return birthdays
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by month only (ignore day and year)', async () => {
      // Arrange
      (Birthday.find as jest.Mock).mockResolvedValue([]);

      // Act: Get this month's birthdays
      await request(app).get('/birthdays/this-month').expect(200);

      // Assert: Query should use $month operator
      const findCall = (Birthday.find as jest.Mock).mock.calls[0][0];
      expect(findCall.$expr.$eq).toBeDefined();
      expect(findCall.$expr.$eq[0].$month).toBeDefined();
    });
  });

  describe('GET /birthdays/:id - Get Birthday By ID', () => {
    it('should return birthday by id', async () => {
      // Arrange: Mock birthday
      const mockBirthday = {
        _id: 'birthday-123',
        userId: 'user-123',
        name: 'John Doe',
        date: new Date('1990-05-15'),
      };

      (Birthday.findOne as jest.Mock).mockResolvedValue(mockBirthday);

      // Act: Get birthday
      const response = await request(app).get('/birthdays/birthday-123').expect(200);

      // Assert: Should return birthday
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data._id).toBe('birthday-123');
    });

    it('should return 404 when birthday not found', async () => {
      // Arrange: Mock not found
      (Birthday.findOne as jest.Mock).mockResolvedValue(null);

      // Act: Get non-existent birthday
      const response = await request(app).get('/birthdays/non-existent-id').expect(404);

      // Assert: Should return not found
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Birthday not found');
    });

    it('should enforce user isolation (only return own birthdays)', async () => {
      // Arrange
      (Birthday.findOne as jest.Mock).mockResolvedValue({ _id: '123' });

      // Act: Get birthday
      await request(app).get('/birthdays/123').expect(200);

      // Assert: Query should filter by userId
      expect(Birthday.findOne).toHaveBeenCalledWith({
        _id: '123',
        userId: 'user-123',
      });
    });

    it('should handle database errors gracefully', async () => {
      // Arrange: Mock error
      (Birthday.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Act: Get birthday
      const response = await request(app).get('/birthdays/123').expect(500);

      // Assert: Should return internal error
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('PUT /birthdays/:id - Update Birthday', () => {
    it('should update birthday successfully', async () => {
      // Arrange: Mock birthday
      const mockBirthday = {
        _id: 'birthday-123',
        userId: 'user-123',
        name: 'Old Name',
        date: new Date('1990-01-01'),
        email: undefined, // ← Add optional fields
        phone: undefined, // ← Add optional fields
        notes: undefined, // ← Add optional fields
        lastWishSent: undefined, // ← Add optional fields
        save: jest.fn().mockResolvedValue(true),
      };

      (Birthday.findOne as jest.Mock).mockResolvedValue(mockBirthday);

      const updates = {
        name: 'Updated Name',
        notes: 'Updated notes',
      };

      // Act: Update birthday
      const response = await request(app).put('/birthdays/birthday-123').send(updates).expect(200);

      // Assert: Should return updated birthday
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(mockBirthday.save).toHaveBeenCalled();
      expect(mockBirthday.name).toBe('Updated Name');
      expect(mockBirthday.notes).toBe('Updated notes');
    });

    it('should return 404 when birthday not found', async () => {
      // Arrange: Mock not found
      (Birthday.findOne as jest.Mock).mockResolvedValue(null);

      // Act: Update non-existent birthday
      const response = await request(app)
        .put('/birthdays/non-existent')
        .send({ name: 'New Name' })
        .expect(404);

      // Assert: Should return not found
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Birthday not found');
    });

    it('should support partial updates', async () => {
      // Arrange: Mock birthday with multiple fields
      const mockBirthday = {
        _id: '123',
        userId: 'user-123',
        name: 'John',
        email: 'john@example.com',
        phone: '555-1234',
        notes: 'Original notes',
        save: jest.fn().mockResolvedValue(true),
      };

      (Birthday.findOne as jest.Mock).mockResolvedValue(mockBirthday);

      // Act: Update only one field
      await request(app).put('/birthdays/123').send({ notes: 'Updated notes only' }).expect(200);

      // Assert: Only notes should change
      expect(mockBirthday.notes).toBe('Updated notes only');
      expect(mockBirthday.name).toBe('John'); // Unchanged
      expect(mockBirthday.email).toBe('john@example.com'); // Unchanged
    });

    it('should enforce user isolation', async () => {
      // Arrange
      (Birthday.findOne as jest.Mock).mockResolvedValue(null);

      // Act: Update birthday
      await request(app).put('/birthdays/123').send({ name: 'New Name' }).expect(404);

      // Assert: Query should filter by userId
      expect(Birthday.findOne).toHaveBeenCalledWith({
        _id: '123',
        userId: 'user-123',
      });
    });
  });

  describe('DELETE /birthdays/:id - Delete Birthday', () => {
    it('should delete birthday successfully', async () => {
      // Arrange: Mock birthday
      const mockBirthday = {
        _id: 'birthday-123',
        name: 'John Doe',
      };

      (Birthday.findOneAndDelete as jest.Mock).mockResolvedValue(mockBirthday);

      // Act: Delete birthday
      const response = await request(app).delete('/birthdays/birthday-123').expect(200);

      // Assert: Should return success message
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Birthday deleted successfully');
    });

    it('should return 404 when birthday not found', async () => {
      // Arrange: Mock not found
      (Birthday.findOneAndDelete as jest.Mock).mockResolvedValue(null);

      // Act: Delete non-existent birthday
      const response = await request(app).delete('/birthdays/non-existent').expect(404);

      // Assert: Should return not found
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Birthday not found');
    });

    it('should enforce user isolation', async () => {
      // Arrange
      (Birthday.findOneAndDelete as jest.Mock).mockResolvedValue(null);

      // Act: Delete birthday
      await request(app).delete('/birthdays/123').expect(404);

      // Assert: Query should filter by userId
      expect(Birthday.findOneAndDelete).toHaveBeenCalledWith({
        _id: '123',
        userId: 'user-123',
      });
    });
  });

  describe('POST /birthdays/:id/wish - Send Birthday Wish', () => {
    it('should send wish successfully when not sent this year', async () => {
      // Arrange: Birthday with no wish sent
      const mockBirthday = {
        _id: 'birthday-123',
        userId: 'user-123',
        name: 'John Doe',
        lastWishSent: undefined,
        save: jest.fn().mockResolvedValue(true),
      };

      (Birthday.findOne as jest.Mock).mockResolvedValue(mockBirthday);

      // Act: Send wish
      const response = await request(app).post('/birthdays/birthday-123/wish').expect(200);

      // Assert: Should succeed
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Birthday wish sent successfully');
      expect(response.body.sentAt).toBeDefined();
      expect(mockBirthday.save).toHaveBeenCalled();
      expect(mockBirthday.lastWishSent).toBeInstanceOf(Date);
    });

    it('should reject wish when already sent this year', async () => {
      // Arrange: Birthday with wish sent this year
      const mockBirthday = {
        _id: 'birthday-123',
        userId: 'user-123',
        name: 'John Doe',
        lastWishSent: new Date(), // Sent today (this year)
        save: jest.fn(),
      };

      (Birthday.findOne as jest.Mock).mockResolvedValue(mockBirthday);

      // Act: Try to send wish again
      const response = await request(app).post('/birthdays/birthday-123/wish').expect(400);

      // Assert: Should reject
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Birthday wish already sent this year');
      expect(response.body.lastSent).toBeDefined();
      expect(mockBirthday.save).not.toHaveBeenCalled();
    });

    it('should allow wish when sent in previous year', async () => {
      // Arrange: Birthday with wish sent last year
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);

      const mockBirthday = {
        _id: 'birthday-123',
        userId: 'user-123',
        name: 'John Doe',
        lastWishSent: lastYear,
        save: jest.fn().mockResolvedValue(true),
      };

      (Birthday.findOne as jest.Mock).mockResolvedValue(mockBirthday);

      // Act: Send wish this year
      const response = await request(app).post('/birthdays/birthday-123/wish').expect(200);

      // Assert: Should succeed
      expect(response.body.success).toBe(true);
      expect(mockBirthday.save).toHaveBeenCalled();

      // Verify lastWishSent was updated to this year
      const thisYear = new Date().getFullYear();
      const updatedYear = new Date(mockBirthday.lastWishSent).getFullYear();
      expect(updatedYear).toBe(thisYear);
    });

    it('should return 404 when birthday not found', async () => {
      // Arrange: Mock not found
      (Birthday.findOne as jest.Mock).mockResolvedValue(null);

      // Act: Send wish to non-existent birthday
      const response = await request(app).post('/birthdays/non-existent/wish').expect(404);

      // Assert: Should return not found
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Birthday not found');
    });

    it('should enforce user isolation', async () => {
      // Arrange
      (Birthday.findOne as jest.Mock).mockResolvedValue(null);

      // Act: Send wish
      await request(app).post('/birthdays/123/wish').expect(404);

      // Assert: Query should filter by userId
      expect(Birthday.findOne).toHaveBeenCalledWith({
        _id: '123',
        userId: 'user-123',
      });
    });
  });
});
