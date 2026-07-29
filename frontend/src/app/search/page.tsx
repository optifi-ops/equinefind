"use client";

import { useState } from "react";
import { useEvents } from "@/hooks/useEvents";
import { useFilterStore } from "@/store/filters";
import { EventCard } from "@/components/EventCard";
import { EventFilters } from "@/components/EventFilters";
import { SearchBar } from "@/components/SearchBar";
import { MapView } from "@/components/MapView";
import { CalendarView } from "@/components/CalendarView";
import { ChevronLeft, ChevronRight, List, Map, CalendarDays } from "lucide-react";

export default function SearchPage() {
  const [viewMode, setViewMode] = useState<"list" | "map" | "calendar">("list");
  const { filters, setFilters } = useFilterStore();
  const { data, isLoading, error } = useEvents({
    ...filters,
    per_page: viewMode === "calendar" ? 200 : filters.per_page,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <SearchBar variant="compact" />
      </div>

      <div className="flex gap-8">
        {/* Filters sidebar */}
        <div className="hidden md:block">
          <EventFilters />
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* View toggle */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate">
              {isLoading ? "Loading..." : data ? `${data.total} events found` : ""}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex border border-border rounded overflow-hidden">
                {([
                  { key: "list", icon: List, label: "List" },
                  { key: "map", icon: Map, label: "Map" },
                  { key: "calendar", icon: CalendarDays, label: "Calendar" },
                ] as const).map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setViewMode(key)}
                    className={`px-3 py-1.5 text-xs flex items-center gap-1 transition-colors ${viewMode === key ? "bg-hunter text-white" : "bg-white text-slate hover:text-charcoal"}`}
                  >
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>
              {viewMode === "list" && (
                <select
                  value={filters.sort ?? "date_asc"}
                  onChange={(e) => setFilters({ sort: e.target.value as "date_asc" | "date_desc" | "distance" })}
                  className="text-sm border border-border rounded px-2 py-1 bg-white text-charcoal focus:outline-none focus:border-hunter"
                >
                  <option value="date_asc">Date: Soonest first</option>
                  <option value="date_desc">Date: Latest first</option>
                  <option value="distance">Distance</option>
                </select>
              )}
            </div>
          </div>

          {/* Calendar view */}
          {viewMode === "calendar" && (
            <div className="mb-4">
              {isLoading ? (
                <div className="h-[600px] bg-white border border-border rounded animate-pulse" />
              ) : (
                <CalendarView events={data?.items ?? []} />
              )}
            </div>
          )}

          {/* Map view */}
          {viewMode === "map" && (
            <div className="h-[600px] border border-border rounded overflow-hidden mb-4">
              <MapView events={data?.items ?? []} center={filters.lat && filters.lng ? { lat: filters.lat, lng: filters.lng } : undefined} />
            </div>
          )}

          {viewMode === "list" && isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-28 bg-white border border-border rounded animate-pulse" />
              ))}
            </div>
          )}

          {viewMode === "list" && error && (
            <div className="text-center py-12 text-slate">
              Failed to load events. Please try again.
            </div>
          )}

          {viewMode === "list" && !isLoading && !error && data && (
            <>
              {data.items.length === 0 ? (
                <div className="text-center py-12 text-slate">
                  No events found. Try expanding your radius or adjusting filters.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.items.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {data.pages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button
                    disabled={filters.page === 1}
                    onClick={() => setFilters({ page: (filters.page ?? 1) - 1 })}
                    className="p-2 border border-border rounded hover:border-hunter disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-slate">
                    Page {data.page} of {data.pages}
                  </span>
                  <button
                    disabled={data.page >= data.pages}
                    onClick={() => setFilters({ page: (filters.page ?? 1) + 1 })}
                    className="p-2 border border-border rounded hover:border-hunter disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
