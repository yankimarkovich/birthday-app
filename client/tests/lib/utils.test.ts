import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const result = cn('base', isActive && 'active');
    expect(result).toBe('base active');
  });

  it('removes falsy values', () => {
    const result = cn('class1', false, 'class2', null, undefined, 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('handles Tailwind class conflicts (twMerge)', () => {
    // twMerge should keep the last class when there are conflicts
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toBe('py-1 px-4'); // px-4 overrides px-2
  });

  it('handles array of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('handles object notation', () => {
    const result = cn({
      'class1': true,
      'class2': false,
      'class3': true,
    });
    expect(result).toBe('class1 class3');
  });

  it('handles complex Tailwind merging', () => {
    // Common pattern: base classes + variant classes
    const result = cn(
      'rounded-md border border-gray-200',
      'border-red-500' // Should override border-gray-200
    );
    expect(result).toBe('rounded-md border border-red-500');
  });

  it('handles empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('handles spacing conflicts', () => {
    const result = cn('p-2', 'p-4');
    expect(result).toBe('p-4'); // Last one wins
  });
});
