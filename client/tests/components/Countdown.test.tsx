import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Countdown } from '@/components/Countdown';

describe('Countdown Component', () => {
  beforeEach(() => {
    // Use fake timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore real timers
    vi.restoreAllMocks();
  });

  it('renders countdown with correct format', () => {
    const now = new Date('2025-01-01T00:00:00Z');
    vi.setSystemTime(now);

    const target = new Date('2025-01-02T03:04:05Z'); // +1d 3h 4m 5s

    render(<Countdown target={target} />);

    // Check that countdown is displayed
    expect(screen.getByText(/1d 3h 4m 5s/)).toBeInTheDocument();
  });

  it('sets up interval to update countdown', () => {
    const now = new Date('2025-01-01T00:00:00Z');
    vi.setSystemTime(now);

    const target = new Date('2025-01-01T00:00:10Z'); // +10 seconds
    const setIntervalSpy = vi.spyOn(global, 'setInterval');

    render(<Countdown target={target} />);

    // Initial render: 10 seconds
    expect(screen.getByText(/0d 0h 0m 10s/)).toBeInTheDocument();

    // Verify setInterval was called with 1000ms (1 second)
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
  });

  it('shows zero when target is in the past', () => {
    const now = new Date('2025-01-02T00:00:00Z');
    vi.setSystemTime(now);

    const target = new Date('2025-01-01T00:00:00Z'); // Past

    render(<Countdown target={target} />);

    // Should show all zeros
    expect(screen.getByText(/0d 0h 0m 0s/)).toBeInTheDocument();
  });

  it('handles large countdowns correctly', () => {
    const now = new Date('2025-01-01T00:00:00Z');
    vi.setSystemTime(now);

    const target = new Date('2025-12-31T23:59:59Z'); // Almost a year

    render(<Countdown target={target} />);

    // Should show many days
    const text = screen.getByText(/\d+d \d+h \d+m \d+s/);
    expect(text).toBeInTheDocument();
    expect(text.textContent).toMatch(/364d 23h 59m 59s/); // 364 days
  });

  it('applies correct CSS classes', () => {
    const target = new Date('2025-01-01T00:00:10Z');

    render(<Countdown target={target} />);

    const countdown = screen.getByText(/\d+d \d+h \d+m \d+s/);

    // Check for expected classes
    expect(countdown).toHaveClass('tabular-nums');
    expect(countdown).toHaveClass('text-sm');
    expect(countdown).toHaveClass('text-muted-foreground');
  });

  it('cleans up interval on unmount', () => {
    const target = new Date('2025-01-01T00:00:10Z');
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    const { unmount } = render(<Countdown target={target} />);

    // Unmount component
    unmount();

    // Verify interval was cleared
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
