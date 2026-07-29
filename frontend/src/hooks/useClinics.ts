"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clinicApi } from "@/lib/api";
import { useAuth } from "./useAuth";
import type { Event } from "@/types/event";
import type { ClinicDetails, ClinicSlot } from "@/types/clinic";

export function useClinicDetails(eventId: string | undefined) {
  return useQuery({
    queryKey: ["clinic-details", eventId],
    queryFn: () => clinicApi.getDetails(eventId!),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useClinicSlotCounts(clinicDetailId: string | undefined) {
  return useQuery({
    queryKey: ["clinic-slot-counts", clinicDetailId],
    queryFn: () => clinicApi.getSlotSignupCounts(clinicDetailId!),
    enabled: !!clinicDetailId,
    staleTime: 1000 * 30,
  });
}

export function useOrganizerClinics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["organizer-clinics", user?.id],
    queryFn: () => clinicApi.listOrganizerClinics(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateClinic() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventData,
      clinicDetails,
      slots,
    }: {
      eventData: Partial<Event>;
      clinicDetails: Omit<ClinicDetails, "id" | "event_id" | "created_at">;
      slots: Omit<ClinicSlot, "id" | "clinic_detail_id" | "created_at" | "signup_count">[];
    }) =>
      clinicApi.createClinic(
        { ...eventData, organizer_user_id: user!.id },
        clinicDetails,
        slots
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer-clinics"] });
    },
  });
}

export function useUpdateClinic(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventUpdates,
      clinicUpdates,
      slots,
    }: {
      eventUpdates: Partial<Event>;
      clinicUpdates: Partial<Omit<ClinicDetails, "id" | "event_id" | "created_at">>;
      slots?: { id?: string; name: string; description?: string; slot_date?: string; max_capacity?: number; price_cents?: number; sort_order: number; duration_minutes?: number; start_time?: string; end_time?: string; riders_per_lesson?: number }[];
    }) => clinicApi.updateClinic(eventId, eventUpdates, clinicUpdates, slots),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer-clinics"] });
      queryClient.invalidateQueries({ queryKey: ["clinic-details", eventId] });
    },
  });
}
