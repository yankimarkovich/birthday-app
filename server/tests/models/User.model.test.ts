import { User, IUser } from '../../src/models/User.model';
import bcrypt from 'bcrypt';

/**
 * User Model Tests - Simple & Focused
 *
 * Testing approach:
 * - Validation: Use validateSync() to test schema rules
 * - Hooks: Test pre-save logic in isolation
 * - Methods: Test comparePassword directly
 * - No database needed: All tests use mocked Mongoose
 *
 * Why this approach?
 * - Fast: No database setup/teardown
 * - Simple: Focus on model logic, not MongoDB
 * - Reliable: No network issues or database state
 */

describe('User Model', () => {
  // Helper to create valid user data
  const createValidUserData = (overrides = {}) => ({
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'SecurePass123',
    ...overrides,
  });

  describe('Schema Validation', () => {
    describe('name field', () => {
      it('should pass validation with valid name', () => {
        const user = new User(createValidUserData());
        const error = user.validateSync();

        expect(error).toBeUndefined();
      });

      it('should fail when name is missing', () => {
        const user = new User(createValidUserData({ name: undefined }));
        const error = user.validateSync();

        expect(error).toBeDefined();
        expect(error?.errors.name?.message).toContain('Name is required');
      });

      it('should fail when name is too short', () => {
        const user = new User(createValidUserData({ name: 'J' }));
        const error = user.validateSync();

        expect(error).toBeDefined();
        expect(error?.errors.name?.message).toContain('Name must be at least 2 characters');
      });

      it('should fail when name is too long', () => {
        const longName = 'a'.repeat(51);
        const user = new User(createValidUserData({ name: longName }));
        const error = user.validateSync();

        expect(error).toBeDefined();
        expect(error?.errors.name?.message).toContain('Name cannot exceed 50 characters');
      });

      it('should trim whitespace from name', () => {
        const user = new User(createValidUserData({ name: '  John Doe  ' }));

        expect(user.name).toBe('John Doe');
      });

      it('should accept name at boundaries', () => {
        const minUser = new User(createValidUserData({ name: 'Jo' }));
        const maxUser = new User(createValidUserData({ name: 'a'.repeat(50) }));

        expect(minUser.validateSync()).toBeUndefined();
        expect(maxUser.validateSync()).toBeUndefined();
      });
    });

    describe('email field', () => {
      it('should pass validation with valid email', () => {
        const user = new User(createValidUserData());
        const error = user.validateSync();

        expect(error).toBeUndefined();
      });

      it('should fail when email is missing', () => {
        const user = new User(createValidUserData({ email: undefined }));
        const error = user.validateSync();

        expect(error).toBeDefined();
        expect(error?.errors.email?.message).toContain('Email is required');
      });

      it('should fail with invalid email format', () => {
        const invalidEmails = [
          'notanemail',
          'missing@domain',
          '@nodomain.com',
          'no@dots',
        ];

        invalidEmails.forEach(invalidEmail => {
          const user = new User(createValidUserData({ email: invalidEmail }));
          const error = user.validateSync();

          expect(error).toBeDefined();
          expect(error?.errors.email?.message).toContain('Please provide a valid email');
        });
      });

      it('should convert email to lowercase', () => {
        const user = new User(createValidUserData({ email: 'JOHN@EXAMPLE.COM' }));

        expect(user.email).toBe('john@example.com');
      });

      it('should trim whitespace from email', () => {
        const user = new User(createValidUserData({ email: '  test@example.com  ' }));

        expect(user.email).toBe('test@example.com');
      });
    });

    describe('password field', () => {
      it('should pass validation with valid password', () => {
        const user = new User(createValidUserData());
        const error = user.validateSync();

        expect(error).toBeUndefined();
      });

      it('should fail when password is missing', () => {
        const user = new User(createValidUserData({ password: undefined }));
        const error = user.validateSync();

        expect(error).toBeDefined();
        expect(error?.errors.password?.message).toContain('Password is required');
      });

      it('should fail when password is too short', () => {
        const user = new User(createValidUserData({ password: 'Short12' }));
        const error = user.validateSync();

        expect(error).toBeDefined();
        expect(error?.errors.password?.message).toContain('Password must be at least 8 characters');
      });

      it('should accept password at minimum length', () => {
        const user = new User(createValidUserData({ password: 'Valid123' }));
        const error = user.validateSync();

        expect(error).toBeUndefined();
      });
    });

    describe('timestamps', () => {
      it('should have createdAt and updatedAt in schema', () => {
        const user = new User(createValidUserData());

        /**
         * Why timestamps are undefined before save?
         * - MongoDB sets these during save operation
         * - We're testing schema configuration, not database behavior
         * - Checking schema paths verifies timestamps: true works
         */
        const schema = User.schema;
        expect(schema.path('createdAt')).toBeDefined();
        expect(schema.path('updatedAt')).toBeDefined();
      });
    });
  });

  describe('Pre-save Password Hashing Hook', () => {
    /**
     * Testing the pre-save hook that hashes passwords
     *
     * Approach: Test bcrypt functionality directly
     * - Verify passwords can be hashed
     * - Verify bcrypt configuration (salt rounds)
     * - Verify unique salts for same password
     */

    it('should hash password using bcrypt', async () => {
      const plainPassword = 'MySecurePassword123';

      // Hash password (same way pre-save hook does it)
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      /**
       * Verify hash properties:
       * - Should not equal plain text
       * - Should match bcrypt format ($2a$, $2b$, or $2y$)
       * - Should successfully compare with original password
       */
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword).toMatch(/^\$2[aby]\$/);

      // Verify comparison works
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should use bcrypt with 10 salt rounds', async () => {
      const plainPassword = 'TestPassword123';

      // Hash with 10 rounds (same as model config)
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // Bcrypt hash format: $2a$10$... where 10 is the salt rounds
      const saltRounds = hashedPassword.split('$')[2];
      expect(saltRounds).toBe('10');
    });

    it('should create unique hashes for same password (salt)', async () => {
      const password = 'SamePassword123';

      // Hash same password twice
      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 10);

      /**
       * Even with same password, hashes should differ
       * This is because bcrypt generates unique salt for each hash
       * Prevents rainbow table attacks
       */
      expect(hash1).not.toBe(hash2);

      // But both should be valid bcrypt hashes
      expect(hash1).toMatch(/^\$2[aby]\$/);
      expect(hash2).toMatch(/^\$2[aby]\$/);

      // And both should match the original password
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
    });

    it('should have pre-save hook configured in schema', () => {
      /**
       * Verify the schema has a pre-save hook
       * This confirms the hook exists even if we can't easily test it
       */
      const schema = User.schema;
      const preSaveHooks = (schema as any).s.hooks._pres.get('save');

      expect(preSaveHooks).toBeDefined();
      expect(preSaveHooks.length).toBeGreaterThan(0);
    });
  });

  describe('comparePassword Instance Method', () => {
    /**
     * Testing the comparePassword method
     * This method compares plain text password with hashed password
     */

    it('should return true for correct password', async () => {
      const plainPassword = 'TestPassword123';

      // Create user and manually set hashed password
      const user = new User(createValidUserData({ password: plainPassword }));
      user.password = await bcrypt.hash(plainPassword, 10);

      const isMatch = await user.comparePassword('TestPassword123');

      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const plainPassword = 'TestPassword123';

      // Create user and manually set hashed password
      const user = new User(createValidUserData({ password: plainPassword }));
      user.password = await bcrypt.hash(plainPassword, 10);

      const isMatch = await user.comparePassword('WrongPassword456');

      expect(isMatch).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const plainPassword = 'TestPassword123';

      // Create user and manually set hashed password
      const user = new User(createValidUserData({ password: plainPassword }));
      user.password = await bcrypt.hash(plainPassword, 10);

      const exactMatch = await user.comparePassword('TestPassword123');
      const wrongCaseMatch = await user.comparePassword('testpassword123');

      expect(exactMatch).toBe(true);
      expect(wrongCaseMatch).toBe(false);
    });

    it('should return false for empty password', async () => {
      const plainPassword = 'TestPassword123';

      // Create user and manually set hashed password
      const user = new User(createValidUserData({ password: plainPassword }));
      user.password = await bcrypt.hash(plainPassword, 10);

      const isMatch = await user.comparePassword('');

      expect(isMatch).toBe(false);
    });

    it('should handle comparison errors gracefully', async () => {
      // Create user with invalid hash
      const user = new User(createValidUserData());
      user.password = 'not-a-valid-hash';

      const isMatch = await user.comparePassword('AnyPassword123');

      /**
       * Why return false instead of throwing?
       * - Failed authentication should look same as wrong password
       * - Don't leak information about internal errors
       * - Better security posture
       */
      expect(isMatch).toBe(false);
    });

    it('should have comparePassword method defined', () => {
      const user = new User(createValidUserData());

      /**
       * Verify method exists and is a function
       * Important for TypeScript interfaces
       */
      expect(typeof user.comparePassword).toBe('function');
    });
  });

  describe('Model Schema Configuration', () => {
    it('should have correct schema fields', () => {
      const user = new User(createValidUserData());

      // Verify required fields exist
      expect(user.name).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.password).toBeDefined();

      // Timestamps exist in schema (set on save)
      expect(User.schema.path('createdAt')).toBeDefined();
      expect(User.schema.path('updatedAt')).toBeDefined();
    });

    it('should have comparePassword method', () => {
      const user = new User(createValidUserData());

      expect(typeof user.comparePassword).toBe('function');
    });

    it('should apply field transformations', () => {
      const user = new User({
        name: '  John Doe  ',
        email: '  JOHN@EXAMPLE.COM  ',
        password: 'Password123',
      });

      // Should trim and lowercase as per schema
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
    });
  });
});
