import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useBirthdays,
  useTodaysBirthdays,
  useThisMonthsBirthdays,
  useCreateBirthday,
  useUpdateBirthday,
  useDeleteBirthday,
  useSendWish,
} from './useBirthdays';
import { api } from '@/lib/axios';

// Mock axios
vi.mock('@/lib/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('useBirthdays Hooks', () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;

  beforeEach(() => {
    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Create wrapper with QueryClientProvider
    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('useBirthdays', () => {
    it('fetches all birthdays successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          { _id: '1', name: 'John', date: '1990-05-15', userId: 'user1' },
          { _id: '2', name: 'Jane', date: '1992-08-20', userId: 'user1' },
        ],
      };

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockResponse });

      const { result } = renderHook(() => useBirthdays(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(api.get).toHaveBeenCalledWith('/birthdays');
    });

    it('handles fetch error', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useBirthdays(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useTodaysBirthdays', () => {
    it('fetches todays birthdays successfully', async () => {
      const mockResponse = {
        success: true,
        data: [{ _id: '1', name: 'John', date: '1990-11-03', userId: 'user1' }],
      };

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockResponse });

      const { result } = renderHook(() => useTodaysBirthdays(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(api.get).toHaveBeenCalledWith('/birthdays/today');
    });
  });

  describe('useThisMonthsBirthdays', () => {
    it('fetches this months birthdays successfully', async () => {
      const mockResponse = {
        success: true,
        data: [
          { _id: '1', name: 'John', date: '1990-11-03', userId: 'user1' },
          { _id: '2', name: 'Jane', date: '1992-11-15', userId: 'user1' },
        ],
      };

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockResponse });

      const { result } = renderHook(() => useThisMonthsBirthdays(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(api.get).toHaveBeenCalledWith('/birthdays/this-month');
    });
  });

  describe('useCreateBirthday', () => {
    it('creates a birthday successfully', async () => {
      const mockResponse = {
        success: true,
        data: { _id: '3', name: 'Bob', date: '1995-12-25', userId: 'user1' },
      };

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const { result } = renderHook(() => useCreateBirthday(), { wrapper });

      const newBirthday = { name: 'Bob', date: '1995-12-25', email: 'bob@example.com' };

      result.current.mutate(newBirthday);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(api.post).toHaveBeenCalledWith('/birthdays', newBirthday);
    });

    it('handles creation error', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Validation error'));

      const { result } = renderHook(() => useCreateBirthday(), { wrapper });

      result.current.mutate({ name: 'Bob', date: '1995-12-25' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useUpdateBirthday', () => {
    it('updates a birthday successfully', async () => {
      const mockResponse = {
        success: true,
        data: { _id: '1', name: 'John Updated', date: '1990-05-15', userId: 'user1' },
      };

      vi.mocked(api.patch).mockResolvedValueOnce({ data: mockResponse });

      const { result } = renderHook(() => useUpdateBirthday(), { wrapper });

      const updateData = { id: '1', payload: { name: 'John Updated' } };

      result.current.mutate(updateData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(api.patch).toHaveBeenCalledWith('/birthdays/1', { name: 'John Updated' });
    });
  });

  describe('useDeleteBirthday', () => {
    it('deletes a birthday successfully', async () => {
      const mockResponse = { success: true, message: 'Birthday deleted' };

      vi.mocked(api.delete).mockResolvedValueOnce({ data: mockResponse });

      const { result } = renderHook(() => useDeleteBirthday(), { wrapper });

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(api.delete).toHaveBeenCalledWith('/birthdays/1');
    });
  });

  describe('useSendWish', () => {
    it('sends a wish successfully', async () => {
      const mockResponse = { success: true, message: 'Birthday wish sent!' };

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

      const { result } = renderHook(() => useSendWish(), { wrapper });

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(api.post).toHaveBeenCalledWith('/birthdays/1/wish');
    });

    it('handles wish sending error', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Already sent this year'));

      const { result } = renderHook(() => useSendWish(), { wrapper });

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });
});
