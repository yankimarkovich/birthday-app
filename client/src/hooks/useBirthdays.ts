import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type {
  BirthdaysListResponse,
  SingleBirthdayResponse,
  DeleteBirthdayResponse,
  BirthdayFormData,
} from '@/types';

// Query keys for React Query cache management
// Hierarchical structure: base key ['birthdays'], then specific subsets
const queryKeys = {
  birthdays: ['birthdays'] as const, // All birthdays (for "All" tab and Calendar)
  todaysBirthdays: ['birthdays', 'today'] as const, // Today's birthdays only
  monthBirthdays: ['birthdays', 'month'] as const, // This month's birthdays
  birthday: (id: string) => ['birthdays', id] as const,
};

/**
 * Fetch all birthdays (no filtering)
 * Used by: "All" tab and Calendar view
 */
export function useBirthdays() {
  return useQuery({
    queryKey: queryKeys.birthdays,
    queryFn: async () => {
      const { data } = await api.get<BirthdaysListResponse>('/birthdays');
      return data;
    },
  });
}

/**
 * Fetch today's birthdays only
 * Used by: "Today" tab (default view)
 * Server filters by month+day, ignoring year
 */
export function useTodaysBirthdays() {
  return useQuery({
    queryKey: queryKeys.todaysBirthdays,
    queryFn: async () => {
      const { data } = await api.get<BirthdaysListResponse>('/birthdays/today');
      return data;
    },
  });
}

/**
 * Fetch this month's birthdays
 * Used by: "This Month" tab
 * Server filters by month only, ignoring day and year
 */
export function useThisMonthsBirthdays() {
  return useQuery({
    queryKey: queryKeys.monthBirthdays,
    queryFn: async () => {
      const { data } = await api.get<BirthdaysListResponse>('/birthdays/this-month');
      return data;
    },
  });
}

export function useCreateBirthday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BirthdayFormData) => {
      const { data } = await api.post<SingleBirthdayResponse>('/birthdays', payload);
      return data;
    },
    onSuccess: () => {
      // This single invalidation covers ALL birthday queries! 🎉
      qc.invalidateQueries({ queryKey: queryKeys.birthdays });
    },
  });
}

export function useUpdateBirthday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<BirthdayFormData> }) => {
      const { data } = await api.patch<SingleBirthdayResponse>(`/birthdays/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      // This single invalidation covers ALL birthday queries! 🎉
      qc.invalidateQueries({ queryKey: queryKeys.birthdays });
    },
  });
}

export function useDeleteBirthday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<DeleteBirthdayResponse>(`/birthdays/${id}`);
      return data;
    },
    onSuccess: () => {
      // This single invalidation covers ALL birthday queries! 🎉
      qc.invalidateQueries({ queryKey: queryKeys.birthdays });
    },
  });
}

export function useSendWish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/birthdays/${id}/wish`);
      return data as { success: true; message: string };
    },
    onSuccess: () => {
      // This single invalidation covers ALL birthday queries! 🎉
      qc.invalidateQueries({ queryKey: queryKeys.birthdays });
    },
  });
}
