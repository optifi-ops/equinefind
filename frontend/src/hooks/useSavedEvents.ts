"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { savedEventsApi } from "@/lib/api";
import { useAuth } from "./useAuth";

export function useSavedEvents() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["saved-events", user?.id],
    queryFn: () => savedEventsApi.list(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}

export function useIsEventSaved(eventId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["saved-event", user?.id, eventId],
    queryFn: () => savedEventsApi.isSaved(user!.id, eventId),
    enabled: !!user && !!eventId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useToggleSaveEvent(eventId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: () => savedEventsApi.save(user!.id, eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-event", user?.id, eventId] });
      queryClient.invalidateQueries({ queryKey: ["saved-events", user?.id] });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: () => savedEventsApi.unsave(user!.id, eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-event", user?.id, eventId] });
      queryClient.invalidateQueries({ queryKey: ["saved-events", user?.id] });
    },
  });

  return { saveMutation, unsaveMutation };
}
