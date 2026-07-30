"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clinicApi, clinicSignupApi, savedEventsApi } from "@/lib/api";
import { useAuth } from "./useAuth";
import type { ClinicSignup } from "@/types/clinic";

export function useClinicSignups(clinicDetailId: string | undefined) {
  return useQuery({
    queryKey: ["clinic-signups", clinicDetailId],
    queryFn: () => clinicSignupApi.listForClinic(clinicDetailId!),
    enabled: !!clinicDetailId,
    staleTime: 1000 * 30,
  });
}

export function useMySignups() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-signups", user?.id],
    queryFn: () => clinicSignupApi.listForUser(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateSignup(eventId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      clinic_slot_id: string;
      rider_name: string;
      rider_email: string;
      rider_notes?: string;
      status?: "confirmed" | "waitlisted";
      horses: {
        horse_id: string;
        horse_name: string;
        ride_time?: string;
      }[];
    }) => clinicSignupApi.signupWithHorses({ ...data, user_id: user!.id }),
    onSuccess: async () => {
      if (eventId && user) {
        await savedEventsApi.save(user.id, eventId).catch(() => {});
      }
      queryClient.invalidateQueries({ queryKey: ["clinic-signups"] });
      queryClient.invalidateQueries({ queryKey: ["clinic-slot-counts"] });
      queryClient.invalidateQueries({ queryKey: ["slot-booked-times"] });
      queryClient.invalidateQueries({ queryKey: ["my-signups"] });
      queryClient.invalidateQueries({ queryKey: ["saved-events"] });
    },
  });
}

export function useSlotBookedTimes(clinicDetailId: string | undefined) {
  return useQuery({
    queryKey: ["slot-booked-times", clinicDetailId],
    queryFn: () => clinicApi.getSlotBookedTimes(clinicDetailId!),
    enabled: !!clinicDetailId,
    staleTime: 1000 * 30,
  });
}

export function useCancelSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (signupId: string) => clinicSignupApi.cancel(signupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-signups"] });
      queryClient.invalidateQueries({ queryKey: ["clinic-slot-counts"] });
      queryClient.invalidateQueries({ queryKey: ["slot-booked-times"] });
      queryClient.invalidateQueries({ queryKey: ["my-signups"] });
    },
  });
}

export function useUpdateSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      signupId,
      updates,
    }: {
      signupId: string;
      updates: Partial<Pick<ClinicSignup, "status" | "payment_status" | "ride_time" | "organizer_notes">>;
    }) => clinicSignupApi.updateSignup(signupId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-signups"] });
      queryClient.invalidateQueries({ queryKey: ["clinic-slot-counts"] });
      queryClient.invalidateQueries({ queryKey: ["slot-booked-times"] });
      queryClient.invalidateQueries({ queryKey: ["my-signups"] });
    },
  });
}

export function useSaveSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rows: { id: string; ride_time: string | null; sort_order: number }[]) =>
      clinicSignupApi.saveSchedule(rows),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-signups"] });
      queryClient.invalidateQueries({ queryKey: ["my-signups"] });
    },
  });
}
