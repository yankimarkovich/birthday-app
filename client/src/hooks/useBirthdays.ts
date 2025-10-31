import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type {
  BirthdaysListResponse,
  SingleBirthdayResponse,
  DeleteBirthdayResponse,
  BirthdayFormData,
} from '@/types';

const queryKeys = {
  birthdays: ['birthdays'] as const,
  birthday: (id: string) => ['birthdays', id] as const,
};

export function useBirthdays() {
  return useQuery({
    queryKey: queryKeys.birthdays,
    queryFn: async () => {
      const { data } = await api.get<BirthdaysListResponse>('/birthdays');
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
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.birthdays });
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
      qc.invalidateQueries({ queryKey: queryKeys.birthdays });
    },
  });
}

export function useSendWish() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/birthdays/${id}/wish`);
      return data as { success: true; message: string };
    },
  });
}

