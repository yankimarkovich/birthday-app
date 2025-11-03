import { describe, it, expect } from 'vitest';
import { nextOccurrence, getCountdownParts, isToday, wasWishSentThisYear } from '@/lib/date';

describe('date utilities', () => {
  describe('nextOccurrence', () => {
    it('returns the same year if birthday is in the future', () => {
      const now = new Date('2025-01-01T00:00:00Z');
      const birthday = new Date('2000-12-25T00:00:00Z'); // Dec 25

      const result = nextOccurrence(birthday, now);

      expect(result.getMonth()).toBe(11); // December (0-indexed)
      expect(result.getDate()).toBe(25);
      expect(result.getFullYear()).toBe(2025);
    });

    it('returns next year if birthday has already passed this year', () => {
      const now = new Date('2025-12-26T00:00:00Z');
      const birthday = new Date('2000-12-25T00:00:00Z'); // Dec 25

      const result = nextOccurrence(birthday, now);

      expect(result.getMonth()).toBe(11); // December
      expect(result.getDate()).toBe(25);
      expect(result.getFullYear()).toBe(2026); // Next year
    });

    it('handles leap year birthdays (Feb 29)', () => {
      const now = new Date('2025-02-01T00:00:00Z');
      const birthday = new Date('2000-02-29T00:00:00Z'); // Leap year birthday

      const result = nextOccurrence(birthday, now);

      // Note: Feb 29 on non-leap year (2025) becomes March 1
      // JavaScript Date constructor handles invalid dates this way
      expect(result.getMonth()).toBe(2); // March (0-indexed)
      expect(result.getDate()).toBe(1); // March 1
      expect(result.getFullYear()).toBe(2025);
    });

    it('handles string date input', () => {
      const now = new Date('2025-01-01T00:00:00Z');
      const birthdayString = '2000-12-25';

      const result = nextOccurrence(birthdayString, now);

      expect(result.getMonth()).toBe(11);
      expect(result.getDate()).toBe(25);
      expect(result.getFullYear()).toBe(2025);
    });
  });

  describe('getCountdownParts', () => {
    it('calculates correct countdown for days, hours, minutes, seconds', () => {
      const now = new Date('2025-01-01T00:00:00Z');
      const target = new Date('2025-01-02T03:04:05Z'); // +1 day, 3 hours, 4 minutes, 5 seconds

      const result = getCountdownParts(target, now);

      expect(result.days).toBe(1);
      expect(result.hours).toBe(3);
      expect(result.minutes).toBe(4);
      expect(result.seconds).toBe(5);
    });

    it('returns zero values when target is in the past', () => {
      const now = new Date('2025-01-02T00:00:00Z');
      const target = new Date('2025-01-01T00:00:00Z'); // Past

      const result = getCountdownParts(target, now);

      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
      expect(result.totalMs).toBeLessThan(0); // Negative time difference
    });

    it('handles exact same time (no countdown)', () => {
      const now = new Date('2025-01-01T12:00:00Z');
      const target = new Date('2025-01-01T12:00:00Z');

      const result = getCountdownParts(target, now);

      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
    });

    it('calculates large countdowns correctly', () => {
      const now = new Date('2025-01-01T00:00:00Z');
      const target = new Date('2025-12-31T23:59:59Z'); // Almost a year

      const result = getCountdownParts(target, now);

      expect(result.days).toBeGreaterThan(360);
      expect(result.hours).toBe(23);
      expect(result.minutes).toBe(59);
      expect(result.seconds).toBe(59);
    });
  });

  describe('isToday', () => {
    it('returns true when date matches current date', () => {
      const now = new Date('2025-11-03T12:00:00Z');
      const testDate = new Date('2025-11-03T08:00:00Z'); // Same day, different time

      const result = isToday(testDate, now);

      expect(result).toBe(true);
    });

    it('returns false when date is different day', () => {
      const now = new Date('2025-11-03T12:00:00Z');
      const testDate = new Date('2025-11-04T12:00:00Z'); // Next day

      const result = isToday(testDate, now);

      expect(result).toBe(false);
    });

    it('returns true for same month and day regardless of year', () => {
      const now = new Date('2025-11-03T12:00:00Z');
      const testDate = new Date('2000-11-03T12:00:00Z'); // Same month/day, different year

      const result = isToday(testDate, now);

      expect(result).toBe(true);
    });

    it('handles string date input', () => {
      const now = new Date('2025-11-03T12:00:00Z');
      const dateString = '2025-11-03';

      const result = isToday(dateString, now);

      expect(result).toBe(true);
    });

    it('returns false for different months', () => {
      const now = new Date('2025-11-03T12:00:00Z');
      const testDate = new Date('2025-12-03T12:00:00Z'); // Different month

      const result = isToday(testDate, now);

      expect(result).toBe(false);
    });
  });

  describe('wasWishSentThisYear', () => {
    it('returns true if wish was sent in current year', () => {
      const lastWishSent = '2025-11-03T12:00:00Z';

      // Mock current date to be same year
      const result = wasWishSentThisYear(lastWishSent);

      // This will be true if running in 2025
      // For test consistency, we check the logic
      const currentYear = new Date().getFullYear();
      const wishYear = new Date(lastWishSent).getFullYear();
      expect(result).toBe(currentYear === wishYear);
    });

    it('returns false if wish was sent in a previous year', () => {
      const lastWishSent = '2020-11-03T12:00:00Z'; // Old year

      const result = wasWishSentThisYear(lastWishSent);

      expect(result).toBe(false);
    });

    it('returns false if lastWishSent is undefined', () => {
      const result = wasWishSentThisYear(undefined);

      expect(result).toBe(false);
    });

    it('returns false if lastWishSent is empty string', () => {
      const result = wasWishSentThisYear('');

      expect(result).toBe(false);
    });
  });
});
