/**
 * Test Setup - Mock Mongoose
 *
 * Why mock instead of real database?
 * - Faster: No need to spin up MongoDB instance
 * - Simpler: No external dependencies or downloads
 * - Isolated: Tests don't depend on database state
 * - Focused: We're testing model logic, not MongoDB itself
 *
 * What we're testing:
 * - Schema validation rules work correctly
 * - Pre-save hooks execute properly
 * - Instance methods behave as expected
 * - Model logic is correct
 */

import mongoose from 'mongoose';

// Mock Mongoose connection
beforeAll(() => {
  // Mock connection methods to prevent actual database connection
  jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose as any);
  jest.spyOn(mongoose, 'disconnect').mockResolvedValue(void 0 as any);
});

// Clean up mocks after all tests
afterAll(() => {
  jest.restoreAllMocks();
});
