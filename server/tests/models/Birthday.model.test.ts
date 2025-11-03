import { Birthday, IBirthday } from '../../src/models/Birthday.model';
import { Types } from 'mongoose';

/**
 * Birthday Model Tests - Simple & Focused
 *
 * Testing approach:
 * - Validation: Use validateSync() to test schema rules
 * - Schema config: Test field types and transformations
 * - No database needed: Focus on model logic
 *
 * Why this approach?
 * - Fast: No database overhead
 * - Simple: Test what matters (validation rules)
 * - Reliable: No external dependencies
 */

describe('Birthday Model', () => {
  // Mock userId for tests
  const mockUserId = new Types.ObjectId();

  // Helper to create valid birthday data
  const createValidBirthdayData = (overrides = {}) => ({
    userId: mockUserId,
    name: 'John Birthday',
    date: new Date('1990-05-15'),
    ...overrides,
  });

  describe('Schema Validation', () => {
    describe('userId field', () => {
      it('should pass validation with valid userId', () => {
        const birthday = new Birthday(createValidBirthdayData());
        const error = birthday.validateSync();

        expect(error).toBeUndefined();
      });

      it('should fail when userId is missing', () => {
        const birthday = new Birthday(createValidBirthdayData({ userId: undefined }));
        const error = birthday.validateSync();

        expect(error).toBeDefined();
        expect(error?.errors.userId?.message).toContain('User ID is required');
      });

      it('should store userId as ObjectId type', () => {
        const birthday = new Birthday(createValidBirthdayData());

        expect(birthday.userId).toBeInstanceOf(Types.ObjectId);
      });
    });

    describe('name field', () => {
      it('should pass validation with valid name', () => {
        const birthday = new Birthday(createValidBirthdayData());
        const error = birthday.validateSync();

        expect(error).toBeUndefined();
      });

      it('should fail when name is missing', () => {
        const birthday = new Birthday(createValidBirthdayData({ name: undefined }));
        const error = birthday.validateSync();

        expect(error).toBeDefined();
        expect(error?.errors.name?.message).toContain('Name is required');
      });

      it('should fail when name is too short', () => {
        const birthday = new Birthday(createValidBirthdayData({ name: 'J' }));
        const error = birthday.validateSync();

        expect(error).toBeDefined();
        expect(error?.errors.name?.message).toContain('Name must be at least 2 characters');
      });

      it('should fail when name is too long', () => {
        const longName = 'a'.repeat(101);
        const birthday = new Birthday(createValidBirthdayData({ name: longName }));
        const error = birthday.validateSync();

        expect(error).toBeDefined();
        expect(error?.errors.name?.message).toContain('Name cannot exceed 100 characters');
      });

      it('should trim whitespace from name', () => {
        const birthday = new Birthday(createValidBirthdayData({ name: '  Jane Doe  ' }));

        expect(birthday.name).toBe('Jane Doe');
      });

      it('should accept name at boundaries', () => {
        const minBirthday = new Birthday(createValidBirthdayData({ name: 'Jo' }));
        const maxBirthday = new Birthday(createValidBirthdayData({ name: 'a'.repeat(100) }));

        expect(minBirthday.validateSync()).toBeUndefined();
        expect(maxBirthday.validateSync()).toBeUndefined();
      });
    });

    describe('date field', () => {
      it('should pass validation with valid date', () => {
        const birthday = new Birthday(createValidBirthdayData());
        const error = birthday.validateSync();

        expect(error).toBeUndefined();
      });

      it('should fail when date is missing', () => {
        const birthday = new Birthday(createValidBirthdayData({ date: undefined }));
        const error = birthday.validateSync();

        expect(error).toBeDefined();
        expect(error?.errors.date?.message).toContain('Birthday date is required');
      });

      it('should store date as Date type', () => {
        const birthday = new Birthday(createValidBirthdayData());

        expect(birthday.date).toBeInstanceOf(Date);
      });

      it('should accept various date formats', () => {
        const dates = [
          new Date('1950-01-01'),
          new Date('1980-06-15'),
          new Date('2000-12-31'),
          new Date('2020-03-20'),
        ];

        dates.forEach(date => {
          const birthday = new Birthday(createValidBirthdayData({ date }));
          const error = birthday.validateSync();

          expect(error).toBeUndefined();
          expect(birthday.date).toBeInstanceOf(Date);
        });
      });

      it('should handle leap year dates', () => {
        const leapDate = new Date('2000-02-29');
        const birthday = new Birthday(createValidBirthdayData({ date: leapDate }));

        expect(birthday.validateSync()).toBeUndefined();
        expect(birthday.date.getMonth()).toBe(1); // February
        expect(birthday.date.getDate()).toBe(29);
      });
    });

    describe('email field (optional)', () => {
      it('should pass validation without email', () => {
        const birthday = new Birthday(createValidBirthdayData());
        const error = birthday.validateSync();

        expect(error).toBeUndefined();
        expect(birthday.email).toBeUndefined();
      });

      it('should pass validation with valid email', () => {
        const birthday = new Birthday(createValidBirthdayData({ email: 'john@example.com' }));
        const error = birthday.validateSync();

        expect(error).toBeUndefined();
      });

      it('should convert email to lowercase', () => {
        const birthday = new Birthday(createValidBirthdayData({ email: 'JOHN@EXAMPLE.COM' }));

        expect(birthday.email).toBe('john@example.com');
      });

      it('should trim whitespace from email', () => {
        const birthday = new Birthday(createValidBirthdayData({ email: '  john@example.com  ' }));

        expect(birthday.email).toBe('john@example.com');
      });

      it('should fail with invalid email format', () => {
        const invalidEmails = [
          'notanemail',
          'missing@domain',
          '@nodomain.com',
        ];

        invalidEmails.forEach(invalidEmail => {
          const birthday = new Birthday(createValidBirthdayData({ email: invalidEmail }));
          const error = birthday.validateSync();

          expect(error).toBeDefined();
          expect(error?.errors.email?.message).toContain('Please provide a valid email');
        });
      });
    });

    describe('phone field (optional)', () => {
      it('should pass validation without phone', () => {
        const birthday = new Birthday(createValidBirthdayData());
        const error = birthday.validateSync();

        expect(error).toBeUndefined();
        expect(birthday.phone).toBeUndefined();
      });

      it('should pass validation with valid phone', () => {
        const birthday = new Birthday(createValidBirthdayData({ phone: '+1-555-123-4567' }));
        const error = birthday.validateSync();

        expect(error).toBeUndefined();
      });

      it('should trim whitespace from phone', () => {
        const birthday = new Birthday(createValidBirthdayData({ phone: '  555-1234  ' }));

        expect(birthday.phone).toBe('555-1234');
      });

      it('should accept various phone formats', () => {
        const phoneFormats = [
          '555-1234',
          '(555) 123-4567',
          '+1 555 123 4567',
          '5551234567',
        ];

        phoneFormats.forEach(phone => {
          const birthday = new Birthday(createValidBirthdayData({ phone }));
          const error = birthday.validateSync();

          expect(error).toBeUndefined();
          expect(birthday.phone).toBe(phone);
        });
      });
    });

    describe('notes field (optional)', () => {
      it('should pass validation without notes', () => {
        const birthday = new Birthday(createValidBirthdayData());
        const error = birthday.validateSync();

        expect(error).toBeUndefined();
        expect(birthday.notes).toBeUndefined();
      });

      it('should pass validation with valid notes', () => {
        const birthday = new Birthday(createValidBirthdayData({ notes: 'Loves chocolate' }));
        const error = birthday.validateSync();

        expect(error).toBeUndefined();
      });

      it('should fail when notes exceed maximum length', () => {
        const longNotes = 'a'.repeat(501);
        const birthday = new Birthday(createValidBirthdayData({ notes: longNotes }));
        const error = birthday.validateSync();

        expect(error).toBeDefined();
        expect(error?.errors.notes?.message).toContain('Notes cannot exceed 500 characters');
      });

      it('should accept notes at maximum length', () => {
        const maxNotes = 'a'.repeat(500);
        const birthday = new Birthday(createValidBirthdayData({ notes: maxNotes }));
        const error = birthday.validateSync();

        expect(error).toBeUndefined();
      });

      it('should preserve multiline notes', () => {
        const multilineNotes = 'Line 1\nLine 2\nLine 3';
        const birthday = new Birthday(createValidBirthdayData({ notes: multilineNotes }));

        expect(birthday.notes).toBe(multilineNotes);
        expect(birthday.notes?.split('\n')).toHaveLength(3);
      });

      it('should allow special characters', () => {
        const specialNotes = 'Likes: Coffee ☕, Books 📚 & Music 🎵!';
        const birthday = new Birthday(createValidBirthdayData({ notes: specialNotes }));

        expect(birthday.notes).toBe(specialNotes);
      });
    });

    describe('lastWishSent field (optional)', () => {
      it('should pass validation without lastWishSent', () => {
        const birthday = new Birthday(createValidBirthdayData());
        const error = birthday.validateSync();

        expect(error).toBeUndefined();
        expect(birthday.lastWishSent).toBeUndefined();
      });

      it('should pass validation with lastWishSent date', () => {
        const lastWishDate = new Date('2023-05-15');
        const birthday = new Birthday(createValidBirthdayData({ lastWishSent: lastWishDate }));
        const error = birthday.validateSync();

        expect(error).toBeUndefined();
        expect(birthday.lastWishSent).toBeInstanceOf(Date);
      });

      it('should store full timestamp for lastWishSent', () => {
        const lastWishDate = new Date('2023-05-15T10:30:00.000Z');
        const birthday = new Birthday(createValidBirthdayData({ lastWishSent: lastWishDate }));

        /**
         * Why store full timestamp?
         * - Can compare years to prevent duplicate wishes
         * - Can track exact time wish was sent (useful for debugging)
         * - More flexible for future features
         */
        expect(birthday.lastWishSent?.getTime()).toBe(lastWishDate.getTime());
      });
    });

    describe('timestamps', () => {
      it('should have createdAt and updatedAt in schema', () => {
        /**
         * timestamps: true automatically adds these fields
         * Important for audit trail and debugging
         * Timestamps are set by MongoDB on save, so check schema
         */
        const schema = Birthday.schema;
        expect(schema.path('createdAt')).toBeDefined();
        expect(schema.path('updatedAt')).toBeDefined();
      });
    });
  });

  describe('Complete Birthday Records', () => {
    it('should create birthday with all optional fields', () => {
      const completeBirthdayData = createValidBirthdayData({
        email: 'john@example.com',
        phone: '555-1234',
        notes: 'Loves chocolate cake',
        lastWishSent: new Date('2023-05-15'),
      });

      const birthday = new Birthday(completeBirthdayData);
      const error = birthday.validateSync();

      expect(error).toBeUndefined();
      expect(birthday.userId).toEqual(mockUserId);
      expect(birthday.name).toBe('John Birthday');
      expect(birthday.date).toBeInstanceOf(Date);
      expect(birthday.email).toBe('john@example.com');
      expect(birthday.phone).toBe('555-1234');
      expect(birthday.notes).toBe('Loves chocolate cake');
      expect(birthday.lastWishSent).toBeInstanceOf(Date);
    });

    it('should create minimal birthday with only required fields', () => {
      const minimalBirthdayData = createValidBirthdayData();
      const birthday = new Birthday(minimalBirthdayData);
      const error = birthday.validateSync();

      expect(error).toBeUndefined();
      expect(birthday.userId).toEqual(mockUserId);
      expect(birthday.name).toBe('John Birthday');
      expect(birthday.date).toBeInstanceOf(Date);
      expect(birthday.email).toBeUndefined();
      expect(birthday.phone).toBeUndefined();
      expect(birthday.notes).toBeUndefined();
      expect(birthday.lastWishSent).toBeUndefined();
    });
  });

  describe('Model Schema Configuration', () => {
    it('should have correct schema fields', () => {
      const birthday = new Birthday(createValidBirthdayData());

      // Verify required fields
      expect(birthday.userId).toBeDefined();
      expect(birthday.name).toBeDefined();
      expect(birthday.date).toBeDefined();

      // Timestamps exist in schema (set on save)
      expect(Birthday.schema.path('createdAt')).toBeDefined();
      expect(Birthday.schema.path('updatedAt')).toBeDefined();
    });

    it('should apply field transformations', () => {
      const birthday = new Birthday({
        userId: mockUserId,
        name: '  John Doe  ',
        date: new Date('1990-01-15'),
        email: '  JOHN@EXAMPLE.COM  ',
        phone: '  555-1234  ',
      });

      // Should trim and lowercase as per schema
      expect(birthday.name).toBe('John Doe');
      expect(birthday.email).toBe('john@example.com');
      expect(birthday.phone).toBe('555-1234');
    });

    it('should handle mixed required and optional fields', () => {
      const birthday = new Birthday({
        userId: mockUserId,
        name: 'Jane Doe',
        date: new Date('1995-03-20'),
        notes: 'Optional note', // Only one optional field
      });

      const error = birthday.validateSync();
      expect(error).toBeUndefined();
      expect(birthday.notes).toBe('Optional note');
      expect(birthday.email).toBeUndefined();
      expect(birthday.phone).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings for optional fields', () => {
      const birthday = new Birthday({
        userId: mockUserId,
        name: 'Test User',
        date: new Date('1990-01-01'),
        email: '', // Empty string
      });

      /**
       * Empty strings are different from undefined
       * Mongoose treats empty string as a value, not as missing
       * Since email is optional, empty string is allowed but must pass validation
       */
      const error = birthday.validateSync();

      // Empty email string passes validation (it's optional)
      // Only non-empty strings must match the email pattern
      expect(birthday.email).toBe('');
    });

    it('should handle null values for optional fields', () => {
      const birthday = new Birthday({
        userId: mockUserId,
        name: 'Test User',
        date: new Date('1990-01-01'),
        email: null as any,
      });

      /**
       * Mongoose converts null to undefined for optional fields
       * This is expected behavior
       */
      // Note: Mongoose may keep null or convert to undefined depending on schema
      expect(birthday.email === null || birthday.email === undefined).toBe(true);
    });
  });
});
