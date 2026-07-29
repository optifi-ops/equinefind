"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { horsesApi } from "@/lib/api";
import { useAuth } from "./useAuth";
import type { Horse } from "@/types/horse";

export function useHorses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["horses", user?.id],
    queryFn: () => horsesApi.list(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateHorse() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (horse: Omit<Horse, "id" | "user_id" | "created_at">) =>
      horsesApi.create({ ...horse, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["horses", user?.id] });
    },
  });
}

export function useUpdateHorse() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Partial<Horse>) =>
      horsesApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["horses", user?.id] });
    },
  });
}

export function useDeleteHorse() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => horsesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["horses", user?.id] });
    },
  });
}
