import { venuesApi, eventsApi } from "@/lib/api";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { MapPin, Globe } from "lucide-react";
import type { Metadata } from "next";
import type { EventListItem } from "@/types/event";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const venue = await venuesApi.get(params.slug);
    return { title: `${venue.name} | EquineFind` };
  } catch {
    return { title: "Venue | EquineFind" };
  }
}

export default async function VenuePage({ params }: Props) {
  let venue;
  try {
    venue = await venuesApi.get(params.slug);
  } catch {
    notFound();
  }

  let events: { items: EventListItem[] } = { items: [] };
  try {
    events = await eventsApi.list({ per_page: 20 });
  } catch {
    // ignore
  }

  const venueEvents = events.items.filter((e) => e.venue?.id === venue.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-4xl text-charcoal">{venue.name}</h1>
        <div className="flex items-center gap-1.5 text-slate">
          <MapPin size={16} className="text-hunter" />
          <span>{venue.city}, {venue.state}</span>
        </div>
        {venue.website && (
          <a href={venue.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-hunter hover:underline">
            <Globe size={14} /> Website
          </a>
        )}
      </header>

      <section className="space-y-4">
        <h2 className="font-display text-2xl text-charcoal">
          Events at this venue {venueEvents.length > 0 && <span className="text-slate text-lg font-normal">({venueEvents.length})</span>}
        </h2>
        {venueEvents.length === 0 ? (
          <p className="text-slate text-sm">No events scheduled at this venue.</p>
        ) : (
          <div className="space-y-3">
            {venueEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
