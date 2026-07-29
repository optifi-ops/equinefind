"use client";

import { useFilterStore } from "@/store/filters";
import { cn } from "@/lib/utils";

const DISCIPLINES = [
  { value: "show_jumping", label: "Show Jumping" },
  { value: "eventing",     label: "Eventing" },
  { value: "dressage",     label: "Dressage" },
  { value: "hunters",      label: "Hunters" },
  { value: "equitation",   label: "Equitation" },
];

const EVENT_TYPES = [
  { value: "recognized", label: "Recognized" },
  { value: "schooling",  label: "Schooling" },
  { value: "clinic",     label: "Clinic" },
];

const RADIUS_OPTIONS = [25, 50, 100, 200, 500];

export function EventFilters() {
  const { filters, setFilters, resetFilters } = useFilterStore();

  const toggleDisc = (v: string) => {
    const d = filters.disciplines ?? [];
    setFilters({ disciplines: d.includes(v) ? d.filter((x) => x !== v) : [...d, v] });
  };

  const toggleType = (v: string) => {
    const t = filters.event_type ?? [];
    setFilters({ event_type: t.includes(v) ? t.filter((x) => x !== v) : [...t, v] });
  };

  return (
    <aside className="w-64 flex-shrink-0 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-charcoal uppercase tracking-wider">Filters</h2>
        <button onClick={resetFilters} className="text-xs text-slate hover:text-hunter underline">
          Reset
        </button>
      </div>

      {/* Radius */}
      <section>
        <h3 className="text-xs font-semibold text-slate uppercase tracking-wider mb-2">Radius</h3>
        <div className="flex flex-wrap gap-1.5">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setFilters({ radius: r })}
              className={cn(
                "px-2.5 py-1 text-xs rounded border transition-colors",
                filters.radius === r
                  ? "bg-hunter text-white border-hunter"
                  : "bg-white text-charcoal border-border hover:border-hunter"
              )}
            >
              {r} mi
            </button>
          ))}
        </div>
      </section>

      {/* Disciplines */}
      <section>
        <h3 className="text-xs font-semibold text-slate uppercase tracking-wider mb-2">Discipline</h3>
        <div className="space-y-1.5">
          {DISCIPLINES.map((d) => (
            <label key={d.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={(filters.disciplines ?? []).includes(d.value)}
                onChange={() => toggleDisc(d.value)}
                className="accent-hunter w-3.5 h-3.5"
              />
              <span className="text-sm text-charcoal group-hover:text-hunter transition-colors">{d.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Event Type */}
      <section>
        <h3 className="text-xs font-semibold text-slate uppercase tracking-wider mb-2">Event Type</h3>
        <div className="space-y-1.5">
          {EVENT_TYPES.map((t) => (
            <label key={t.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={(filters.event_type ?? []).includes(t.value)}
                onChange={() => toggleType(t.value)}
                className="accent-hunter w-3.5 h-3.5"
              />
              <span className="text-sm text-charcoal group-hover:text-hunter transition-colors">{t.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Membership */}
      <section>
        <h3 className="text-xs font-semibold text-slate uppercase tracking-wider mb-2">Membership</h3>
        <div className="space-y-1.5">
          {[
            { key: "requires_usef", label: "USEF required" },
            { key: "requires_usea", label: "USEA required" },
            { key: "requires_usdf", label: "USDF required" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={!!(filters as Record<string, unknown>)[key]}
                onChange={(e) => setFilters({ [key]: e.target.checked || undefined })}
                className="accent-hunter w-3.5 h-3.5"
              />
              <span className="text-sm text-charcoal group-hover:text-hunter transition-colors">{label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Date Range */}
      <section>
        <h3 className="text-xs font-semibold text-slate uppercase tracking-wider mb-2">Date Range</h3>
        <div className="space-y-2">
          <input
            type="date"
            value={filters.date_from ?? ""}
            onChange={(e) => setFilters({ date_from: e.target.value || undefined })}
            className="w-full px-2 py-1.5 text-sm border border-border rounded text-charcoal focus:outline-none focus:border-hunter"
          />
          <input
            type="date"
            value={filters.date_to ?? ""}
            onChange={(e) => setFilters({ date_to: e.target.value || undefined })}
            className="w-full px-2 py-1.5 text-sm border border-border rounded text-charcoal focus:outline-none focus:border-hunter"
          />
        </div>
      </section>
    </aside>
  );
}
