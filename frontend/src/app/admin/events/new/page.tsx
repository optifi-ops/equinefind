"use client";

/**
 * Admin event entry form — optimized for speed (<3 min per event).
 * Used by admin team to enter schooling shows found via Facebook monitoring.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { eventsApi, venuesApi } from "@/lib/api";
import { ExternalLink } from "lucide-react";
import type { Venue } from "@/types/venue";
import type { EventType } from "@/types/event";
import { DISCIPLINE_OPTIONS } from "@/lib/utils";

const LEVELS_BY_DISCIPLINE: Record<string, string[]> = {
  eventing: ["Starter", "Beginner Novice", "Novice", "Training", "Modified", "Preliminary", "Intermediate", "Advanced"],
  dressage: ["Intro", "Training", "First", "Second", "Third", "Fourth", "Prix St Georges", "Intermediaire I", "Grand Prix"],
  show_jumping: ["2'", "2'3\"", "2'6\"", "2'9\"", "3'", "3'3\"", "3'6\"", "1.10m", "1.15m", "1.20m", "1.30m"],
  hunters: ["Short Stirrup", "Children's", "Adults'", "3'", "3'3\"", "3'6\""],
  equitation: ["Short Stirrup", "Children's", "Medals"],
};

const EVENT_TYPES = ["schooling", "recognized", "clinic", "schooling_day", "other"];

export default function NewEventPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    event_type: "schooling",
    start_date: "",
    end_date: "",
    venue_id: "",
    registration_url: "",
    entry_close_date: "",
    disciplines: [] as string[],
    levels_offered: [] as string[],
    requires_usef: false,
    requires_usea: false,
    requires_usdf: false,
    organizer_name: "",
    organizer_email: "",
    organizer_phone: "",
    description: "",
    entry_fee_notes: "",
    cost_notes: "",
  });

  const [venueQuery, setVenueQuery] = useState("");
  const [venueResults, setVenueResults] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const searchVenues = async (q: string) => {
    if (q.length < 2) { setVenueResults([]); return; }
    const results = await venuesApi.list({ q });
    setVenueResults(results);
  };

  const selectVenue = (v: Venue) => {
    setSelectedVenue(v);
    setVenueQuery(v.name);
    setVenueResults([]);
    setForm((f) => ({ ...f, venue_id: v.id }));
  };

  const toggleDisc = (d: string) => {
    setForm((f) => ({
      ...f,
      disciplines: f.disciplines.includes(d) ? f.disciplines.filter((x) => x !== d) : [...f.disciplines, d],
      levels_offered: [],
    }));
  };

  const toggleLevel = (l: string) => {
    setForm((f) => ({
      ...f,
      levels_offered: f.levels_offered.includes(l) ? f.levels_offered.filter((x) => x !== l) : [...f.levels_offered, l],
    }));
  };

  const availableLevels = form.disciplines.flatMap((d) => LEVELS_BY_DISCIPLINE[d] ?? []);

  const handleSubmit = async (e: React.FormEvent, _draft = false) => {
    e.preventDefault();
    if (!form.venue_id) { setError("Please select a venue."); return; }
    if (!form.disciplines.length) { setError("Please select at least one discipline."); return; }

    setSaving(true);
    setError("");
    try {
      await eventsApi.create({
        ...form,
        event_type: form.event_type as EventType,
        status: "upcoming",
      });
      router.push("/admin/events");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const setDate = (key: string, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    // Auto-fill end_date when start_date set (common case: single-day schooling show)
    if (key === "start_date" && !form.end_date) {
      setForm((f) => ({ ...f, start_date: val, end_date: val }));
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-charcoal">Add Event</h1>
        <p className="text-sm text-slate mt-1">Optimized for speed — target under 3 minutes.</p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <Field label="Event Title *">
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Spring Schooling Show at Morven Park"
            className="input"
            autoFocus
          />
        </Field>

        {/* Event Type */}
        <Field label="Event Type *">
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, event_type: t }))}
                className={`px-3 py-1.5 text-sm rounded border transition-colors capitalize ${
                  form.event_type === t
                    ? "bg-hunter text-white border-hunter"
                    : "bg-white text-charcoal border-border hover:border-hunter"
                }`}
              >
                {t.replace("_", " ")}
              </button>
            ))}
          </div>
        </Field>

        {/* Venue autocomplete */}
        <Field label="Venue *">
          <div className="relative">
            <input
              type="text"
              value={venueQuery}
              onChange={(e) => { setVenueQuery(e.target.value); searchVenues(e.target.value); }}
              placeholder="Type venue name..."
              className="input"
            />
            {venueResults.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white border border-border rounded shadow-card max-h-48 overflow-y-auto">
                {venueResults.map((v) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => selectVenue(v)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-mist text-charcoal"
                    >
                      {v.name} — {v.city}, {v.state}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedVenue && (
            <p className="text-xs text-green-700 mt-1">
              ✓ {selectedVenue.name}, {selectedVenue.city}, {selectedVenue.state}
            </p>
          )}
          <p className="text-xs text-slate mt-1">
            Venue not found?{" "}
            <a href="/admin/venues" target="_blank" className="text-hunter hover:underline">
              Add new venue
            </a>{" "}
            then come back here.
          </p>
        </Field>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date *">
            <input
              type="date"
              required
              value={form.start_date}
              onChange={(e) => setDate("start_date", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="End Date *">
            <input
              type="date"
              required
              value={form.end_date}
              min={form.start_date}
              onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
              className="input"
            />
          </Field>
        </div>

        {/* Entry close date */}
        <Field label="Entry Close Date">
          <input
            type="date"
            value={form.entry_close_date}
            max={form.start_date}
            onChange={(e) => setForm((f) => ({ ...f, entry_close_date: e.target.value }))}
            className="input"
          />
        </Field>

        {/* Disciplines */}
        <Field label="Disciplines *">
          <div className="flex flex-wrap gap-2">
            {DISCIPLINE_OPTIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => toggleDisc(d.value)}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                  form.disciplines.includes(d.value)
                    ? "bg-hunter text-white border-hunter"
                    : "bg-white text-charcoal border-border hover:border-hunter"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </Field>

        {/* Levels (dynamic based on selected disciplines) */}
        {availableLevels.length > 0 && (
          <Field label="Levels Offered">
            <div className="flex flex-wrap gap-2">
              {availableLevels.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => toggleLevel(l)}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                    form.levels_offered.includes(l)
                      ? "bg-hunter-light text-hunter border-hunter/30"
                      : "bg-white text-charcoal border-border hover:border-hunter"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </Field>
        )}

        {/* Membership requirements */}
        <Field label="Membership Required">
          <div className="flex gap-4">
            {[
              { key: "requires_usef", label: "USEF" },
              { key: "requires_usea", label: "USEA" },
              { key: "requires_usdf", label: "USDF" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-1.5 cursor-pointer text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={(form as Record<string, unknown>)[key] as boolean}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                  className="accent-hunter"
                />
                {label}
              </label>
            ))}
          </div>
        </Field>

        {/* Registration URL */}
        <Field label="Registration URL">
          <div className="flex gap-2">
            <input
              type="url"
              value={form.registration_url}
              onChange={(e) => setForm((f) => ({ ...f, registration_url: e.target.value }))}
              placeholder="https://..."
              className="input flex-1"
            />
            {form.registration_url && (
              <a
                href={form.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-2 text-sm border border-border rounded text-slate hover:text-hunter hover:border-hunter transition-colors"
              >
                <ExternalLink size={14} /> Test
              </a>
            )}
          </div>
        </Field>

        {/* Organizer */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Organizer Name">
            <input
              type="text"
              value={form.organizer_name}
              onChange={(e) => setForm((f) => ({ ...f, organizer_name: e.target.value }))}
              className="input"
            />
          </Field>
          <Field label="Organizer Email">
            <input
              type="email"
              value={form.organizer_email}
              onChange={(e) => setForm((f) => ({ ...f, organizer_email: e.target.value }))}
              className="input"
            />
          </Field>
        </div>

        {/* Cost Notes */}
        <Field label="Estimated Cost (per horse)">
          <input
            type="text"
            value={form.cost_notes}
            onChange={(e) => setForm((f) => ({ ...f, cost_notes: e.target.value }))}
            placeholder="e.g. $150-250 per horse"
            className="input"
          />
        </Field>

        {/* Description */}
        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className="input resize-none"
            placeholder="Additional details..."
          />
        </Field>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? "Saving..." : "Publish Event"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={(e) => handleSubmit(e, true)}
            className="btn-secondary"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-slate hover:text-charcoal ml-auto"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-charcoal">{label}</label>
      {children}
    </div>
  );
}
