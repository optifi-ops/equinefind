"use client";

import { useEvents } from "@/hooks/useEvents";
import { useFilterStore } from "@/store/filters";
import { EventCard } from "./EventCard";
import { format, addDays } from "date-fns";

export function HomepageEvents() {
  const { filters } = useFilterStore();

  const today = format(new Date(), "yyyy-MM-dd");
  const in90 = format(addDays(new Date(), 90), "yyyy-MM-dd");

  const { data, isLoading, error } = useEvents({
    ...filters,
    date_from: today,
    date_to: in90,
    per_page: 6,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-white border border-border rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data?.items.length) {
    return (
      <p className="text-center text-slate mt-8 text-sm">
        {filters.zip
          ? `No upcoming events found near ${filters.zip}.`
          : "Enter your ZIP code above to find events near you."}
      </p>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-charcoal mb-4">
        {filters.zip ? `Upcoming events near ${filters.zip}` : "Upcoming events"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.items.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
