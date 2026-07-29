"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ClinicForm } from "@/components/ClinicForm";
import { useClinicDetails, useUpdateClinic } from "@/hooks/useClinics";
import { venuesApi } from "@/lib/api";
import { Loader2 } from "lucide-react";
import type { Event } from "@/types/event";
import type { Venue } from "@/types/venue";

interface Props {
  params: { id: string };
}

export default function EditClinicPage({ params }: Props) {
  const eventId = params.id;
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const { data: clinicData, isLoading: clinicLoading } = useClinicDetails(eventId);
  const updateClinic = useUpdateClinic(eventId);

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ["event-for-edit", eventId],
    queryFn: async () => {
      const { supabase } = await import("@/lib/auth");
      const { data, error } = await supabase
        .from("events")
        .select("*, venue:venues(id, name, slug, city, state, country, website)")
        .eq("id", eventId)
        .single();
      if (error) throw new Error(error.message);
      return data as Event;
    },
  });

  useEffect(() => {
    venuesApi.list().then(setVenues);
  }, []);

  if (eventLoading || clinicLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-hunter" />
      </div>
    );
  }

  if (!event || !clinicData) {
    return <p className="text-slate text-center py-10">Clinic not found.</p>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-charcoal">Edit Clinic</h1>
        <p className="text-slate text-sm mt-1">{event.title}</p>
      </header>

      {updateClinic.error && (
        <div className="card p-3 bg-red-50 border-red-500 text-red-700 text-sm">
          Save failed: {(updateClinic.error as Error).message}
        </div>
      )}

      <ClinicForm
        initialEvent={event}
        initialClinic={clinicData}
        initialSlots={clinicData.slots}
        venues={venues}
        loading={updateClinic.isPending}
        submitLabel="Save Changes"
        onSubmit={({ event: eventUpdates, clinicDetails, slots }) => {
          updateClinic.mutate(
            { eventUpdates, clinicUpdates: clinicDetails, slots },
            {
              onSuccess: () => router.push(`/account/clinics/${eventId}`),
            }
          );
        }}
      />
    </div>
  );
}
