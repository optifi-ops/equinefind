"use client";

import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, Loader2, Wand2, Clock, Calendar as CalendarIcon } from "lucide-react";
import { useSaveSchedule } from "@/hooks/useClinicSignups";
import { addMinutesToTime, toTimeInputValue } from "@/lib/timeBlocks";
import type { ClinicSlot, ClinicSignup } from "@/types/clinic";

const DEFAULT_RIDE_LENGTH = 45;

interface Entry {
  id: string; // clinic_signup_horses.id — one rider+horse lesson
  riderName: string;
  horseName: string;
  status: ClinicSignup["status"];
  time: string; // "HH:MM" for <input type="time">, "" if unset
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

  // Build the initial running order: signups in the order they registered,
  // and within each signup the horses in their stored order.
  const initialEntries = useMemo<Entry[]>(() => {
    const rows: { entry: Entry; sort: number; created: number }[] = [];
    signups.forEach((s) => {
      const created = new Date(s.created_at).getTime();
      const horses = [...(s.horses ?? [])].sort((a, b) => a.sort_order - b.sort_order);
      horses.forEach((h) => {
        rows.push({
          entry: {
            id: h.id,
            riderName: s.rider_name,
            horseName: h.horse?.name ?? "Horse removed",
            status: s.status,
            time: toTimeInputValue(h.ride_time),
          },
          sort: h.sort_order,
          created,
        });
      });
    });
    // If a schedule was saved before, sort_order is globally meaningful; otherwise
    // fall back to registration order (created_at).
    const anyOrdered = rows.some((r) => r.sort > 0);
    rows.sort((a, b) =>
      anyOrdered ? a.sort - b.sort || a.created - b.created : a.created - b.created
    );
    return rows.map((r) => r.entry);
  }, [signups]);

  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [startTime, setStartTime] = useState<string>(
    () => initialEntries.find((e) => e.time)?.time ?? "08:00"
  );
  const [dirty, setDirty] = useState(false);

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= entries.length) return;
    const next = [...entries];
    [next[index], next[target]] = [next[target], next[index]];
    setEntries(next);
    setDirty(true);
  };

  const setRowTime = (index: number, value: string) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, time: value } : e)));
    setDirty(true);
  };

  const autoAssign = () => {
    if (!startTime) return;
    setEntries((prev) =>
      prev.map((e, i) => ({
        ...e,
        time: toTimeInputValue(addMinutesToTime(startTime, i * rideLength)),
      }))
    );
    setDirty(true);
  };

  const handleSave = () => {
    const rows = entries.map((e, i) => ({
      id: e.id,
      ride_time: e.time ? `${e.time}:00` : null,
      sort_order: i,
    }));
    saveSchedule.mutate(rows, { onSuccess: () => setDirty(false) });
  };

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
            {entries.length} ride{entries.length !== 1 ? "s" : ""} ·{" "}
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

      {entries.length === 0 ? (
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
              {entries.map((e, i) => (
                <tr key={e.id}>
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
                        disabled={i === entries.length - 1}
                        className="text-slate hover:text-hunter disabled:opacity-25 disabled:hover:text-slate"
                        title="Move down"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate">{i + 1}</td>
                  <td className="px-3 py-2">
                    <span className="text-charcoal">{e.riderName}</span>
                    {e.status === "waitlisted" && (
                      <span className={`ml-2 px-1.5 py-0.5 text-[10px] rounded-full ${statusBadge.waitlisted}`}>
                        waitlist
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-charcoal">{e.horseName}</td>
                  <td className="px-3 py-2">
                    <input
                      type="time"
                      value={e.time}
                      onChange={(ev) => setRowTime(i, ev.target.value)}
                      className="input py-1 text-sm w-28"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {entries.length > 0 && (
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
