"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { savedEventHorsesApi } from "@/lib/api";

export function useSavedEventHorses(savedEventId: string | undefined) {
  return useQuery({
    queryKey: ["saved-event-horses", savedEventId],
    queryFn: () => savedEventHorsesApi.listForEvent(savedEventId!),
    enabled: !!savedEventId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSetSavedEventHorses(savedEventId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (horseIds: string[]) =>
      savedEventHorsesApi.setForEvent(savedEventId!, horseIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-event-horses", savedEventId] });
      queryClient.invalidateQueries({ queryKey: ["saved-events"] });
    },
  });
}
