import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import type { EventListItem } from "@/types/event";
import { EventTypeBadge } from "./EventTypeBadge";
import { MembershipBadges } from "./MembershipBadges";
import { formatDateRange, formatDiscipline } from "@/lib/utils";

interface Props {
  event: EventListItem;
}

const typeAccent: Record<string, string> = {
  recognized: "border-l-gold",
  schooling: "border-l-sage",
  clinic: "border-l-slate",
};

export function EventCard({ event }: Props) {
  return (
    <Link href={`/events/${event.slug}`} className="block group">
      <article
        className={[
          "bg-white border border-border rounded pl-3 pr-4 py-4",
          "border-l-4",
          typeAccent[event.event_type] ?? "border-l-border",
          "shadow-card hover:shadow-card-hover transition-shadow cursor-pointer",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-xl text-charcoal group-hover:text-hunter transition-colors leading-snug truncate">
              {event.title}
            </h3>

            {event.venue && (
              <div className="flex items-center gap-1 mt-1 text-sm text-slate">
                <MapPin size={13} className="flex-shrink-0" />
                <span className="truncate">
                  {event.venue.name}, {event.venue.city}, {event.venue.state}
                </span>
                {event.distance_miles != null && (
                  <span className="ml-1 text-xs text-slate/70 flex-shrink-0">
                    ({event.distance_miles} mi)
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-1 mt-1 text-sm text-slate">
              <Calendar size={13} className="flex-shrink-0" />
              <span>{formatDateRange(event.start_date, event.end_date)}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <EventTypeBadge type={event.event_type} />
            {event.status === "cancelled" && (
              <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Cancelled</span>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {event.disciplines.map((d) => (
              <span key={d} className="px-2 py-0.5 text-xs rounded bg-hunter-light text-hunter font-medium">
                {formatDiscipline(d)}
              </span>
            ))}
          </div>
          <MembershipBadges
            requires_usef={event.requires_usef}
            requires_usea={event.requires_usea}
            requires_usdf={event.requires_usdf}
          />
        </div>
      </article>
    </Link>
  );
}
