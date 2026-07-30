"use client";

import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, Loader2, Wand2, Clock, Calendar as CalendarIcon, AlertTriangle } from "lucide-react";
import { useSaveSchedule } from "@/hooks/useClinicSignups";
import { addMinutesToTime, toTimeInputValue } from "@/lib/timeBlocks";
import { horseAgeLabel } from "@/lib/utils";
import type { ClinicSlot, ClinicSignup } from "@/types/clinic";

const DEFAULT_RIDE_LENGTH = 45;

interface Row {
  id: string; // clinic_signup_horses.id — one rider+horse lesson
  riderName: string;
  horseName: string;
  horseMeta: string; // "8 yrs • Gelding"
  status: ClinicSignup["status"];
  time: string; // "HH:MM" for <input type="time">, "" if unset
}

/** Minutes since midnight for an "HH:MM" time; untimed rows sort to the end. */
function timeToMinutes(time: string): number {
  if (!time) return Number.POSITIVE_INFINITY;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

interface Props {
  slots: ClinicSlot[];
  signups: (ClinicSignup & { slot_name: string })[];
}

export function ClinicScheduler({ slots, signups }: Props) {
  const activeSignups = signups.filter((s) => s.status !== "cancelled");

  const hasAnyRiders = activeSignups.some((s) => (s.horses?.length ?? 0) > 0);

  if (!hasAnyRiders) {
    return (
      <div className="card p-8 text-center">
        <CalendarIcon size={32} className="mx-auto text-slate/40 mb-2" />
        <p className="text-slate text-sm">No riders to schedule yet.</p>
        <p className="text-xs text-slate/70 mt-1">
          Once riders sign up, group them by slot and assign ride times here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate">
        Set the running order for each slot, then assign ride times. Use{" "}
        <span className="font-medium text-charcoal">Auto-assign</span> to fill times from a start
        time using the slot&apos;s ride length, then fine-tune any row.
      </p>
      {slots.map((slot) => (
        <SlotScheduler
          key={slot.id}
          slot={slot}
          signups={activeSignups.filter((s) => s.clinic_slot_id === slot.id)}
        />
      ))}
    </div>
  );
}

function SlotScheduler({
  slot,
  signups,
}: {
  slot: ClinicSlot;
  signups: (ClinicSignup & { slot_name: string })[];
}) {
  const saveSchedule = useSaveSchedule();
  const rideLength = slot.duration_minutes ?? DEFAULT_RIDE_LENGTH;

  // The running order is DRIVEN BY TIME: rows are always sorted ascending by
  // ride time (untimed rows sink to the bottom, keeping their relative order).
  // Editing a time re-sorts that row into place; the arrows swap a rider's time
  // with the neighbour's so they trade places in the running order.
  const sortRows = (rs: Row[]): Row[] =>
    [...rs].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  const initialRows = useMemo<Row[]>(() => {
    const rows: { row: Row; sort: number; created: number }[] = [];
    signups.forEach((s) => {
      const created = new Date(s.created_at).getTime();
      const horses = [...(s.horses ?? [])].sort((a, b) => a.sort_order - b.sort_order);
      horses.forEach((h) => {
        rows.push({
          row: {
            id: h.id,
            riderName: s.rider_name,
            horseName: h.horse?.name ?? "Horse removed",
            horseMeta: [horseAgeLabel(h.horse?.birth_year), h.horse?.gender]
              .filter(Boolean)
              .join(" • "),
            status: s.status,
            time: toTimeInputValue(h.ride_time),
          },
          sort: h.sort_order,
          created,
        });
      });
    });
    // Primary order is by time; ties (and untimed rows) fall back to any saved
    // order, then registration order.
    rows.sort(
      (a, b) =>
        timeToMinutes(a.row.time) - timeToMinutes(b.row.time) ||
        a.sort - b.sort ||
        a.created - b.created
    );
    return rows.map((r) => r.row);
  }, [signups]);

  const [rows, setRows] = useState<Row[]>(initialRows);
  const [startTime, setStartTime] = useState<string>(
    () => rows.find((r) => r.time)?.time ?? "08:00"
  );
  const [dirty, setDirty] = useState(false);

  // Swap this rider's time with the neighbour's, then re-sort — the rider moves
  // up/down in the running order and takes that slot's time.
  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const next = rows.map((r) => ({ ...r }));
    const t = next[index].time;
    next[index].time = next[target].time;
    next[target].time = t;
    setRows(sortRows(next));
    setDirty(true);
  };

  const setRowTime = (id: string, value: string) => {
    setRows((prev) => sortRows(prev.map((r) => (r.id === id ? { ...r, time: value } : r))));
    setDirty(true);
  };

  const autoAssign = () => {
    if (!startTime) return;
    setRows((prev) =>
      prev.map((r, i) => ({ ...r, time: toTimeInputValue(addMinutesToTime(startTime, i * rideLength)) }))
    );
    setDirty(true);
  };

  const handleSave = () => {
    const payload = rows.map((r, i) => ({
      id: r.id,
      ride_time: r.time ? `${r.time}:00` : null,
      sort_order: i,
    }));
    saveSchedule.mutate(payload, { onSuccess: () => setDirty(false) });
  };

  // A ride overlaps the previous one if it starts before that ride ends.
  const conflictIds = useMemo(() => {
    const ids = new Set<string>();
    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1];
      const cur = rows[i];
      if (!prev.time || !cur.time) continue;
      if (timeToMinutes(cur.time) < timeToMinutes(prev.time) + rideLength) {
        ids.add(prev.id);
        ids.add(cur.id);
      }
    }
    return ids;
  }, [rows, rideLength]);

  const statusBadge: Record<string, string> = {
    confirmed: "bg-hunter/10 text-hunter",
    waitlisted: "bg-gold-light text-gold",
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-display text-lg text-charcoal">
            {slot.name}
            {slot.slot_date && (
              <span className="text-sm text-slate font-normal ml-2">
                {new Date(slot.slot_date + "T00:00").toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </h3>
          <p className="text-xs text-slate mt-0.5">
            {rows.length} ride{rows.length !== 1 ? "s" : ""} ·{" "}
            <span className="inline-flex items-center gap-1">
              <Clock size={11} />
              {rideLength} min each
            </span>
            {slot.duration_minutes == null && (
              <span className="text-gold"> (default — set ride length in Edit)</span>
            )}
          </p>
        </div>

        <div className="flex items-end gap-2">
          <div>
            <label className="block text-xs text-slate mb-0.5">Start time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input py-1.5 text-sm w-32"
            />
          </div>
          <button
            type="button"
            onClick={autoAssign}
            className="btn-secondary text-sm inline-flex items-center gap-1.5 h-[38px]"
          >
            <Wand2 size={14} />
            Auto-assign
          </button>
        </div>
      </div>

      {conflictIds.size > 0 && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          <AlertTriangle size={14} className="flex-shrink-0" />
          Some ride times overlap (rides are {rideLength} min long). Adjust the highlighted times.
        </div>
      )}

      {rows.length === 0 ? (
        <p className="text-sm text-slate">No riders in this slot.</p>
      ) : (
        <div className="border border-border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-mist border-b border-border">
              <tr>
                <th className="w-16 px-2 py-2"></th>
                <th className="text-left px-3 py-2 text-xs font-medium text-slate uppercase tracking-wider">
                  Order
                </th>
                <th className="text-left px-3 py-2 text-xs font-medium text-slate uppercase tracking-wider">
                  Rider
                </th>
                <th className="text-left px-3 py-2 text-xs font-medium text-slate uppercase tracking-wider">
                  Horse
                </th>
                <th className="text-left px-3 py-2 text-xs font-medium text-slate uppercase tracking-wider">
                  Ride Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r, i) => {
                const conflict = conflictIds.has(r.id);
                return (
                <tr key={r.id} className={conflict ? "bg-red-50" : ""}>
                  <td className="px-2 py-2">
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        className="text-slate hover:text-hunter disabled:opacity-25 disabled:hover:text-slate"
                        title="Move up"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(i, 1)}
                        disabled={i === rows.length - 1}
                        className="text-slate hover:text-hunter disabled:opacity-25 disabled:hover:text-slate"
                        title="Move down"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate">{i + 1}</td>
                  <td className="px-3 py-2">
                    <span className="text-charcoal">{r.riderName}</span>
                    {r.status === "waitlisted" && (
                      <span className={`ml-2 px-1.5 py-0.5 text-[10px] rounded-full ${statusBadge.waitlisted}`}>
                        waitlist
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-charcoal">{r.horseName}</span>
                    {r.horseMeta && <span className="text-slate text-xs"> · {r.horseMeta}</span>}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="time"
                        value={r.time}
                        onChange={(ev) => setRowTime(r.id, ev.target.value)}
                        className={`input py-1 text-sm w-28 ${conflict ? "border-red-400" : ""}`}
                      />
                      {conflict && (
                        <AlertTriangle size={14} className="text-red-500 flex-shrink-0" aria-label="Overlaps another ride" />
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > 0 && (
        <div className="flex items-center justify-end gap-3">
          {saveSchedule.isError && (
            <span className="text-xs text-red-500">
              {(saveSchedule.error as Error).message}
            </span>
          )}
          {!dirty && saveSchedule.isSuccess && (
            <span className="text-xs text-hunter">Saved</span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saveSchedule.isPending}
            className="btn-primary text-sm inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            {saveSchedule.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving…
              </>
            ) : (
              "Save schedule"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
