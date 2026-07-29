"use client";

import { useState } from "react";
import { Plus, Trash2, Clock } from "lucide-react";
import type { Event } from "@/types/event";
import type { ClinicDetails, ClinicSlot } from "@/types/clinic";
import { generateTimeBlocks } from "@/lib/timeBlocks";
import type { Venue } from "@/types/venue";

const DISCIPLINES = [
  { value: "show_jumping", label: "Show Jumping" },
  { value: "eventing", label: "Eventing" },
  { value: "dressage", label: "Dressage" },
  { value: "hunters", label: "Hunters" },
  { value: "equitation", label: "Equitation" },
];

const LEVELS = [
  "Beginner Novice",
  "Novice",
  "Training",
  "Modified",
  "Preliminary",
  "Intermediate",
  "Advanced",
];

interface SlotDraft {
  id?: string;
  name: string;
  description: string;
  slot_date: string;
  max_capacity: string;
  price: string;
  enable_time_blocks: boolean;
  duration_minutes: string;
  start_time: string;
  end_time: string;
  riders_per_lesson: string;
}

interface ClinicFormData {
  event: Partial<Event>;
  clinicDetails: Omit<ClinicDetails, "id" | "event_id" | "created_at">;
  slots: { id?: string; name: string; description?: string; slot_date?: string; max_capacity?: number; price_cents?: number; sort_order: number; duration_minutes?: number; start_time?: string; end_time?: string; riders_per_lesson?: number }[];
}

interface Props {
  initialEvent?: Event;
  initialClinic?: ClinicDetails;
  initialSlots?: ClinicSlot[];
  venues: Venue[];
  onSubmit: (data: ClinicFormData) => void;
  loading: boolean;
  submitLabel?: string;
}

export function ClinicForm({ initialEvent, initialClinic, initialSlots, venues, onSubmit, loading, submitLabel = "Create Clinic" }: Props) {
  const [title, setTitle] = useState(initialEvent?.title ?? "");
  const [description, setDescription] = useState(initialEvent?.description ?? "");
  const [venueId, setVenueId] = useState(initialEvent?.venue?.id ?? "");
  const [startDate, setStartDate] = useState(initialEvent?.start_date ?? "");
  const [endDate, setEndDate] = useState(initialEvent?.end_date ?? "");
  const [disciplines, setDisciplines] = useState<string[]>(initialEvent?.disciplines ?? []);
  const [levelsOffered, setLevelsOffered] = useState<string[]>(initialEvent?.levels_offered ?? []);
  const [costNotes, setCostNotes] = useState(initialEvent?.cost_notes ?? "");

  const [clinicianName, setClinicianName] = useState(initialClinic?.clinician_name ?? "");
  const [clinicianBio, setClinicianBio] = useState(initialClinic?.clinician_bio ?? "");
  const [signupOpenDate, setSignupOpenDate] = useState(initialClinic?.signup_open_date ?? "");
  const [signupCloseDate, setSignupCloseDate] = useState(initialClinic?.signup_close_date ?? "");
  const [notes, setNotes] = useState(initialClinic?.notes ?? "");

  const emptySlot: SlotDraft = { name: "", description: "", slot_date: "", max_capacity: "", price: "", enable_time_blocks: false, duration_minutes: "", start_time: "", end_time: "", riders_per_lesson: "1" };

  const [slots, setSlots] = useState<SlotDraft[]>(
    initialSlots?.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description ?? "",
      slot_date: s.slot_date ?? "",
      max_capacity: s.max_capacity?.toString() ?? "",
      price: s.price_cents ? (s.price_cents / 100).toFixed(2) : "",
      enable_time_blocks: !!(s.duration_minutes || s.start_time || s.end_time),
      duration_minutes: s.duration_minutes?.toString() ?? "",
      start_time: s.start_time?.slice(0, 5) ?? "",
      end_time: s.end_time?.slice(0, 5) ?? "",
      riders_per_lesson: (s.riders_per_lesson ?? 1).toString(),
    })) ?? [{ ...emptySlot }]
  );

  const [venueSearch, setVenueSearch] = useState("");

  const filteredVenues = venues.filter(
    (v) => venueSearch === "" || v.name.toLowerCase().includes(venueSearch.toLowerCase())
  );

  const toggleDisc = (val: string) => {
    setDisciplines((prev) =>
      prev.includes(val) ? prev.filter((d) => d !== val) : [...prev, val]
    );
  };

  const toggleLevel = (val: string) => {
    setLevelsOffered((prev) =>
      prev.includes(val) ? prev.filter((l) => l !== val) : [...prev, val]
    );
  };

  const addSlot = () => {
    setSlots((prev) => [...prev, { ...emptySlot }]);
  };

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof SlotDraft, value: string) => {
    setSlots((prev) => prev.map((s, i) => {
      if (i !== index) return s;
      if (field === "enable_time_blocks") return { ...s, enable_time_blocks: value === "true" };
      return { ...s, [field]: value };
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const eventData: Partial<Event> = {
      title,
      description: description || undefined,
      venue_id: venueId || undefined,
      start_date: startDate,
      end_date: endDate || startDate,
      disciplines,
      levels_offered: levelsOffered.length > 0 ? levelsOffered : undefined,
      cost_notes: costNotes || undefined,
      status: "upcoming",
      requires_usef: false,
      requires_usea: false,
      requires_usdf: false,
      is_featured: false,
    } as Partial<Event>;

    const clinicDetails: Omit<ClinicDetails, "id" | "event_id" | "created_at"> = {
      clinician_name: clinicianName || undefined,
      clinician_bio: clinicianBio || undefined,
      signup_open_date: signupOpenDate || undefined,
      signup_close_date: signupCloseDate || undefined,
      notes: notes || undefined,
    };

    const parsedSlots = slots
      .filter((s) => s.name.trim())
      .map((s, i) => ({
        ...(s.id ? { id: s.id } : {}),
        name: s.name.trim(),
        description: s.description.trim() || undefined,
        slot_date: s.slot_date || undefined,
        max_capacity: s.max_capacity ? parseInt(s.max_capacity) : undefined,
        price_cents: s.price ? Math.round(parseFloat(s.price) * 100) : undefined,
        sort_order: i,
        duration_minutes: s.enable_time_blocks && s.duration_minutes ? parseInt(s.duration_minutes) : undefined,
        start_time: s.enable_time_blocks && s.start_time ? `${s.start_time}:00` : undefined,
        end_time: s.enable_time_blocks && s.end_time ? `${s.end_time}:00` : undefined,
        riders_per_lesson: s.enable_time_blocks && s.riders_per_lesson ? parseInt(s.riders_per_lesson) : undefined,
      }));

    onSubmit({ event: eventData, clinicDetails, slots: parsedSlots });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Event Basics */}
      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl text-charcoal">Event Details</h2>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input"
            placeholder="e.g., Dressage Clinic with Jane Smith"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="input"
            placeholder="Details about the clinic..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Venue</label>
          <input
            type="text"
            value={venueSearch}
            onChange={(e) => setVenueSearch(e.target.value)}
            className="input mb-1"
            placeholder="Search venues..."
          />
          <select
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            className="input"
          >
            <option value="">Select a venue</option>
            {filteredVenues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — {v.city}, {v.state}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Start Date *</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Disciplines</label>
          <div className="flex flex-wrap gap-2">
            {DISCIPLINES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleDisc(value)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  disciplines.includes(value)
                    ? "bg-hunter text-white border-hunter"
                    : "bg-white text-slate border-border hover:border-hunter"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Levels Offered</label>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => toggleLevel(level)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  levelsOffered.includes(level)
                    ? "bg-hunter text-white border-hunter"
                    : "bg-white text-slate border-border hover:border-hunter"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Cost Notes</label>
          <input
            type="text"
            value={costNotes}
            onChange={(e) => setCostNotes(e.target.value)}
            className="input"
            placeholder="e.g., $200/ride, $50/audit"
          />
        </div>
      </section>

      {/* Clinician Info */}
      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl text-charcoal">Clinician</h2>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Clinician Name</label>
          <input
            type="text"
            value={clinicianName}
            onChange={(e) => setClinicianName(e.target.value)}
            className="input"
            placeholder="e.g., Jane Smith"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Clinician Bio</label>
          <textarea
            value={clinicianBio}
            onChange={(e) => setClinicianBio(e.target.value)}
            rows={3}
            className="input"
            placeholder="Brief background on the clinician..."
          />
        </div>
      </section>

      {/* Signup Settings */}
      <section className="card p-6 space-y-4">
        <h2 className="font-display text-xl text-charcoal">Signup Settings</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Signup Opens</label>
            <input
              type="date"
              value={signupOpenDate}
              onChange={(e) => setSignupOpenDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Signup Closes</label>
            <input
              type="date"
              value={signupCloseDate}
              onChange={(e) => setSignupCloseDate(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Notes for Riders</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="input"
            placeholder="Any additional info for riders signing up..."
          />
        </div>
      </section>

      {/* Slot Builder */}
      <section className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-charcoal">Slot Types</h2>
          <button
            type="button"
            onClick={addSlot}
            className="btn-secondary text-sm inline-flex items-center gap-1.5"
          >
            <Plus size={14} />
            Add Slot
          </button>
        </div>
        <p className="text-sm text-slate">
          Define different registration categories. Leave capacity empty for unlimited spots.
        </p>

        <div className="space-y-4">
          {slots.map((slot, index) => (
            <div key={index} className="border border-border rounded p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate uppercase tracking-wider">
                  Slot {index + 1}
                </span>
                {slots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSlot(index)}
                    className="p-1 text-slate hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate mb-0.5">Name *</label>
                <input
                  type="text"
                  value={slot.name}
                  onChange={(e) => updateSlot(index, "name", e.target.value)}
                  className="input"
                  placeholder="e.g., Private Lesson, Group Ride, Audit"
                />
              </div>

              <div>
                <label className="block text-xs text-slate mb-0.5">Description</label>
                <input
                  type="text"
                  value={slot.description}
                  onChange={(e) => updateSlot(index, "description", e.target.value)}
                  className="input"
                  placeholder="Optional details about this slot type"
                />
              </div>

              <div>
                <label className="block text-xs text-slate mb-0.5">Date</label>
                <input
                  type="date"
                  value={slot.slot_date}
                  onChange={(e) => updateSlot(index, "slot_date", e.target.value)}
                  min={startDate || undefined}
                  max={endDate || startDate || undefined}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate mb-0.5">Max Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={slot.max_capacity}
                    onChange={(e) => updateSlot(index, "max_capacity", e.target.value)}
                    className="input"
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate mb-0.5">Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={slot.price}
                    onChange={(e) => updateSlot(index, "price", e.target.value)}
                    className="input"
                    placeholder="Free"
                  />
                </div>
              </div>

              {/* Time Block Scheduling */}
              <div className="border-t border-border pt-3 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slot.enable_time_blocks}
                    onChange={(e) => updateSlot(index, "enable_time_blocks", e.target.checked ? "true" : "")}
                    className="rounded border-border text-hunter focus:ring-hunter"
                  />
                  <span className="text-xs font-medium text-charcoal flex items-center gap-1">
                    <Clock size={12} />
                    Enable Time Block Scheduling
                  </span>
                </label>

                {slot.enable_time_blocks && (
                  <div className="mt-3 space-y-3 pl-6">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate mb-0.5">Lesson Duration (min)</label>
                        <input
                          type="number"
                          min="15"
                          step="15"
                          required
                          value={slot.duration_minutes}
                          onChange={(e) => updateSlot(index, "duration_minutes", e.target.value)}
                          className="input"
                          placeholder="60"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate mb-0.5">Start Time</label>
                        <input
                          type="time"
                          required
                          value={slot.start_time}
                          onChange={(e) => updateSlot(index, "start_time", e.target.value)}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate mb-0.5">End Time</label>
                        <input
                          type="time"
                          required
                          value={slot.end_time}
                          onChange={(e) => updateSlot(index, "end_time", e.target.value)}
                          className="input"
                        />
                      </div>
                    </div>
                    <div className="w-1/3">
                      <label className="block text-xs text-slate mb-0.5">Riders per Lesson</label>
                      <input
                        type="number"
                        min="1"
                        value={slot.riders_per_lesson}
                        onChange={(e) => updateSlot(index, "riders_per_lesson", e.target.value)}
                        className="input"
                        placeholder="1"
                      />
                    </div>
                    {slot.duration_minutes && slot.start_time && slot.end_time && (() => {
                      const blocks = generateTimeBlocks(
                        `${slot.start_time}:00`,
                        `${slot.end_time}:00`,
                        parseInt(slot.duration_minutes)
                      );
                      return blocks.length > 0 ? (
                        <p className="text-xs text-hunter">
                          Generates {blocks.length} time block{blocks.length !== 1 ? "s" : ""}: {blocks.map((b) => b.time).join(", ")}
                        </p>
                      ) : (
                        <p className="text-xs text-red-500">
                          No time blocks fit in this window. Adjust duration or time range.
                        </p>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <button type="submit" disabled={loading || !title || !startDate} className="btn-primary">
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
