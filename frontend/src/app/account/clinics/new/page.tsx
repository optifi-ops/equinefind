"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClinicForm } from "@/components/ClinicForm";
import { useCreateClinic } from "@/hooks/useClinics";
import { venuesApi } from "@/lib/api";
import type { Venue } from "@/types/venue";

export default function NewClinicPage() {
  const router = useRouter();
  const createClinic = useCreateClinic();
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    venuesApi.list().then(setVenues);
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-charcoal">Create Clinic</h1>
        <p className="text-slate text-sm mt-1">Set up a new clinic listing with signup slots</p>
      </header>

      <ClinicForm
        venues={venues}
        loading={createClinic.isPending}
        onSubmit={({ event, clinicDetails, slots }) => {
          createClinic.mutate(
            { eventData: event, clinicDetails, slots },
            {
              onSuccess: ({ event }) => {
                router.push(`/account/clinics/${event.id}`);
              },
            }
          );
        }}
      />
    </div>
  );
}
