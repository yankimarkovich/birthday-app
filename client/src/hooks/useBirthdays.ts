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
 * Note: Should be lazy-loaded (use enabled option in component)
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
 * This is typically 2-5 records - very fast!
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
 * This is typically 10-20 records - good for planning ahead
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
      // Invalidate all birthday-related queries to refetch fresh data
      // This ensures all tabs show the newly created birthday
      qc.invalidateQueries({ queryKey: queryKeys.birthdays });
      qc.invalidateQueries({ queryKey: queryKeys.todaysBirthdays });
      qc.invalidateQueries({ queryKey: queryKeys.monthBirthdays });
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
    onSuccess: (_data, vars) => {
      // Invalidate all birthday queries since the update might affect any view
      // Example: Changing date might move birthday from "today" to another day
      qc.invalidateQueries({ queryKey: queryKeys.birthdays });
      qc.invalidateQueries({ queryKey: queryKeys.todaysBirthdays });
      qc.invalidateQueries({ queryKey: queryKeys.monthBirthdays });
      qc.invalidateQueries({ queryKey: queryKeys.birthday(vars.id) });
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
      // Invalidate all birthday queries to remove deleted birthday from all views
      qc.invalidateQueries({ queryKey: queryKeys.birthdays });
      qc.invalidateQueries({ queryKey: queryKeys.todaysBirthdays });
      qc.invalidateQueries({ queryKey: queryKeys.monthBirthdays });
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
      // ✅ CRITICAL FIX: Invalidate all birthday queries to refetch updated lastWishSent
      // Without this, the button won't update until manual page refresh
      qc.invalidateQueries({ queryKey: queryKeys.birthdays });
      qc.invalidateQueries({ queryKey: queryKeys.todaysBirthdays });
      qc.invalidateQueries({ queryKey: queryKeys.monthBirthdays });
    },
  });
}
