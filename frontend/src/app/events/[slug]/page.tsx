import { eventsApi } from "@/lib/api";
import { notFound } from "next/navigation";
import { EventTypeBadge } from "@/components/EventTypeBadge";
import { MembershipBadges } from "@/components/MembershipBadges";
import { formatDateRange, formatDiscipline } from "@/lib/utils";
import { MapPin, Calendar, ExternalLink, Phone, Mail } from "lucide-react";
import { SaveEventButton } from "@/components/SaveEventButton";
import { ClinicSignupSection } from "@/components/ClinicSignupSection";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const event = await eventsApi.get(params.slug);
    return { title: `${event.title} | EquineFind`, description: event.description ?? undefined };
  } catch {
    return { title: "Event | EquineFind" };
  }
}

export default async function EventDetailPage({ params }: Props) {
  let event;
  try {
    event = await eventsApi.get(params.slug);
  } catch {
    notFound();
  }

  const venue = event.venue;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Hero */}
      <header className="space-y-3">
        <div className="flex items-start gap-3 flex-wrap">
          <EventTypeBadge type={event.event_type} />
          {event.status === "cancelled" && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-red-50 text-red-600 border border-red-200 rounded uppercase tracking-wide">
              Cancelled
            </span>
          )}
          {event.status === "postponed" && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200 rounded uppercase tracking-wide">
              Postponed
            </span>
          )}
        </div>

        <h1 className="font-display text-4xl text-charcoal leading-tight">{event.title}</h1>

        {venue && (
          <div className="flex items-center gap-1.5 text-lg text-slate">
            <MapPin size={18} className="flex-shrink-0 text-hunter" />
            <span>{venue.name}, {venue.city}, {venue.state}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-base text-slate">
          <Calendar size={16} className="flex-shrink-0 text-hunter" />
          <span>{formatDateRange(event.start_date, event.end_date)}</span>
        </div>
      </header>

      {/* Key info strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoBlock label="Disciplines" value={event.disciplines.map(formatDiscipline).join(", ")} />
        {event.levels_offered?.length ? (
          <InfoBlock label="Levels" value={event.levels_offered.join(", ")} />
        ) : null}
        {event.cost_notes && (
          <InfoBlock label="Est. Cost" value={event.cost_notes} />
        )}
        {event.entry_close_date && (
          <InfoBlock label="Entries Close" value={event.entry_close_date} />
        )}
      </div>

      {/* Membership requirements */}
      <section className="card p-5 space-y-3">
        <h2 className="font-display text-xl text-charcoal">Membership Requirements</h2>
        <MembershipBadges
          requires_usef={event.requires_usef}
          requires_usea={event.requires_usea}
          requires_usdf={event.requires_usdf}
          className="gap-2"
        />
        {!event.requires_usef && !event.requires_usea && !event.requires_usdf && (
          <p className="text-sm text-slate">No governing body membership required.</p>
        )}
      </section>

      {/* Clinic Registration */}
      {event.event_type === "clinic" && event.status !== "cancelled" && (
        <ClinicSignupSection eventId={event.id} />
      )}

      {/* Registration CTA + Save */}
      <div className="bg-hunter-light border border-hunter/20 rounded p-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-charcoal">
            {event.event_type === "clinic"
              ? "Interested in this clinic?"
              : event.registration_url && event.status !== "cancelled"
                ? "Ready to compete?"
                : "Interested in this event?"}
          </p>
          {event.entry_close_date && event.status !== "cancelled" && (
            <p className="text-sm text-slate">Entries close {event.entry_close_date}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <SaveEventButton eventId={event.id} />
          {event.event_type !== "clinic" && event.registration_url && event.status !== "cancelled" && (
            <a
              href={event.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 whitespace-nowrap"
            >
              Enter This Show
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <section className="space-y-2">
          <h2 className="font-display text-xl text-charcoal">About this event</h2>
          <p className="text-base text-slate leading-relaxed whitespace-pre-line">{event.description}</p>
        </section>
      )}

      {/* Venue card */}
      {venue && (
        <section className="card p-5 space-y-2">
          <h2 className="font-display text-xl text-charcoal">Venue</h2>
          <p className="font-medium text-charcoal">{venue.name}</p>
          <p className="text-sm text-slate">{venue.city}, {venue.state}</p>
          {venue.website && (
            <a href={venue.website} target="_blank" rel="noopener noreferrer" className="text-sm text-hunter hover:underline inline-flex items-center gap-1">
              Visit venue website <ExternalLink size={12} />
            </a>
          )}
        </section>
      )}

      {/* Organizer */}
      {(event.organizer_name || event.organizer_email || event.organizer_phone) && (
        <section className="space-y-2">
          <h2 className="font-display text-xl text-charcoal">Contact</h2>
          {event.organizer_name && <p className="font-medium text-charcoal">{event.organizer_name}</p>}
          {event.organizer_email && (
            <a href={`mailto:${event.organizer_email}`} className="flex items-center gap-1.5 text-sm text-hunter hover:underline">
              <Mail size={14} />{event.organizer_email}
            </a>
          )}
          {event.organizer_phone && (
            <a href={`tel:${event.organizer_phone}`} className="flex items-center gap-1.5 text-sm text-hunter hover:underline">
              <Phone size={14} />{event.organizer_phone}
            </a>
          )}
        </section>
      )}
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3">
      <p className="text-xs text-slate uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-medium text-charcoal">{value}</p>
    </div>
  );
}
