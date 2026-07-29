"use client";

import Link from "next/link";
import { useEvents } from "@/hooks/useEvents";
import { useFilterStore } from "@/store/filters";
import { formatDateRange } from "@/lib/utils";
import { EventTypeBadge } from "@/components/EventTypeBadge";
import { Pencil } from "lucide-react";

export default function AdminEventsPage() {
  const { filters, setFilters } = useFilterStore();
  const { data, isLoading } = useEvents({ ...filters, per_page: 50 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-charcoal">Events</h1>
        <Link href="/admin/events/new" className="btn-primary text-sm">+ New Event</Link>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search events..."
          value={filters.q ?? ""}
          onChange={(e) => setFilters({ q: e.target.value || undefined })}
          className="input w-72"
        />
        <select
          value={(filters.event_type ?? []).join(",") || ""}
          onChange={(e) => setFilters({ event_type: e.target.value ? [e.target.value] : undefined })}
          className="input w-40"
        >
          <option value="">All types</option>
          <option value="recognized">Recognized</option>
          <option value="schooling">Schooling</option>
          <option value="clinic">Clinic</option>
        </select>
      </div>

      {isLoading && <p className="text-sm text-slate">Loading...</p>}

      {!isLoading && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-mist border-b border-border">
              <tr>
                {["Title", "Venue", "Date", "Type", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.items.map((event) => (
                <tr key={event.id} className="hover:bg-mist/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-charcoal">{event.title}</td>
                  <td className="px-4 py-3 text-slate">
                    {event.venue?.name}, {event.venue?.state}
                  </td>
                  <td className="px-4 py-3 text-slate whitespace-nowrap">
                    {formatDateRange(event.start_date, event.end_date)}
                  </td>
                  <td className="px-4 py-3">
                    <EventTypeBadge type={event.event_type} />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/events/${event.id}/edit`} className="text-hunter hover:underline inline-flex items-center gap-1">
                      <Pencil size={12} /> Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.items.length && (
            <p className="px-4 py-8 text-center text-sm text-slate">No events found.</p>
          )}
        </div>
      )}
    </div>
  );
}
