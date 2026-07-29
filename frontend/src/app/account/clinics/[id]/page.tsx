"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useClinicDetails, useClinicSlotCounts } from "@/hooks/useClinics";
import { useClinicSignups, useUpdateSignup } from "@/hooks/useClinicSignups";
import { formatDateRange } from "@/lib/utils";
import * as Popover from "@radix-ui/react-popover";
import { Loader2, Download, Pencil, Check, X, Users, Calendar, MapPin, Info } from "lucide-react";
import { formatTimeValue } from "@/lib/timeBlocks";
import type { ClinicSignup, ClinicSignupHorse } from "@/types/clinic";

interface Props {
  params: { id: string };
}

interface EventSummary {
  title: string;
  start_date: string;
  end_date: string;
  venue?: { name: string; city: string; state: string };
}

export default function ClinicManagementPage({ params }: Props) {
  const eventId = params.id;
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const { data: clinicData, isLoading: clinicLoading } = useClinicDetails(eventId);
  const { data: _counts } = useClinicSlotCounts(clinicData?.id);
  const { data: signups, isLoading: signupsLoading } = useClinicSignups(clinicData?.id);
  const updateSignup = useUpdateSignup();

  const { data: eventData, isLoading: eventLoading } = useQuery<EventSummary>({
    queryKey: ["event-detail", eventId],
    queryFn: async () => {
      const { supabase } = await import("@/lib/auth");
      const { data, error } = await supabase
        .from("events")
        .select("title, start_date, end_date, venue:venues!inner(name, city, state)")
        .eq("id", eventId)
        .single();
      if (error) throw new Error(error.message);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = data as any;
      return {
        title: row.title,
        start_date: row.start_date,
        end_date: row.end_date,
        venue: Array.isArray(row.venue) ? row.venue[0] : row.venue,
      };
    },
  });

  if (eventLoading || clinicLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-hunter" />
      </div>
    );
  }

  if (!clinicData || !eventData) {
    return (
      <div className="card p-8 text-center">
        <p className="text-slate">Clinic not found.</p>
        <Link href="/account/clinics" className="text-hunter text-sm hover:underline mt-2 inline-block">
          Back to clinics
        </Link>
      </div>
    );
  }

  const slots = clinicData.slots;
  const filteredSignups = activeSlot
    ? signups?.filter((s) => s.clinic_slot_id === activeSlot)
    : signups;

  const confirmedCount = signups?.filter((s) => s.status === "confirmed").length ?? 0;
  const waitlistedCount = signups?.filter((s) => s.status === "waitlisted").length ?? 0;
  const totalSignups = signups?.filter((s) => s.status !== "cancelled").length ?? 0;

  const exportCSV = () => {
    if (!signups) return;
    const active = signups.filter((s) => s.status !== "cancelled");
    const headers = ["Slot", "Rider Name", "Email", "Horse", "Breed", "Level", "Disciplines", "Registration #", "Status", "Payment", "Ride Time", "Rider Notes", "Organizer Notes", "Signed Up"];
    const rows: string[][] = [];
    for (const s of active) {
      if (s.horses && s.horses.length > 0) {
        for (const sh of s.horses) {
          const h = sh.horse;
          rows.push([
            s.slot_name, s.rider_name, s.rider_email,
            h?.name ?? "Removed", h?.breed ?? "", h?.level ?? "",
            h?.disciplines?.join(", ") ?? "", h?.usef_number ?? "",
            s.status, s.payment_status,
            sh.ride_time ? formatTimeValue(sh.ride_time) : "",
            s.rider_notes ?? "", s.organizer_notes ?? "",
            new Date(s.created_at).toLocaleDateString(),
          ]);
        }
      } else {
        rows.push([
          s.slot_name, s.rider_name, s.rider_email,
          s.horse_name ?? "", "", "", "", "",
          s.status, s.payment_status,
          s.ride_time ?? "",
          s.rider_notes ?? "", s.organizer_notes ?? "",
          new Date(s.created_at).toLocaleDateString(),
        ]);
      }
    }
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${eventData.title.replace(/[^a-zA-Z0-9]/g, "_")}_signups.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl text-charcoal">{eventData.title}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-slate">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDateRange(eventData.start_date, eventData.end_date)}
            </span>
            {eventData.venue && (
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {eventData.venue.name}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/account/clinics/${eventId}/edit`} className="btn-secondary text-sm inline-flex items-center gap-1.5">
            <Pencil size={14} />
            Edit
          </Link>
          <button onClick={exportCSV} className="btn-secondary text-sm inline-flex items-center gap-1.5">
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-semibold text-charcoal">{confirmedCount}</p>
          <p className="text-xs text-slate">Confirmed</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-semibold text-gold">{waitlistedCount}</p>
          <p className="text-xs text-slate">Waitlisted</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-semibold text-charcoal">{totalSignups}</p>
          <p className="text-xs text-slate">Total Active</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveSlot(null)}
          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
            !activeSlot ? "bg-hunter text-white border-hunter" : "bg-white text-slate border-border hover:border-hunter"
          }`}
        >
          All ({totalSignups})
        </button>
        {slots.map((slot) => {
          const slotCount = signups?.filter((s) => s.clinic_slot_id === slot.id && s.status !== "cancelled").length ?? 0;
          const cap = slot.max_capacity ? `${slotCount}/${slot.max_capacity}` : slotCount;
          return (
            <button
              key={slot.id}
              onClick={() => setActiveSlot(slot.id)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                activeSlot === slot.id ? "bg-hunter text-white border-hunter" : "bg-white text-slate border-border hover:border-hunter"
              }`}
            >
              {slot.name} ({cap})
            </button>
          );
        })}
      </div>

      {signupsLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={20} className="animate-spin text-hunter" />
        </div>
      ) : filteredSignups && filteredSignups.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-mist border-b border-border">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-medium text-slate uppercase tracking-wider">Rider</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-slate uppercase tracking-wider">Horse</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-slate uppercase tracking-wider">Slot</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-slate uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-slate uppercase tracking-wider">Payment</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-slate uppercase tracking-wider">Ride Time</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-slate uppercase tracking-wider">Notes</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSignups
                  .filter((s) => s.status !== "cancelled")
                  .map((signup) => (
                    <SignupRow
                      key={signup.id}
                      signup={signup}
                      onUpdate={(updates) =>
                        updateSignup.mutate({ signupId: signup.id, updates })
                      }
                    />
                  ))}
                {filteredSignups.filter((s) => s.status === "cancelled").length > 0 && (
                  <>
                    <tr>
                      <td colSpan={8} className="px-4 py-2 text-xs text-slate font-medium bg-mist">
                        Cancelled
                      </td>
                    </tr>
                    {filteredSignups
                      .filter((s) => s.status === "cancelled")
                      .map((signup) => (
                        <SignupRow
                          key={signup.id}
                          signup={signup}
                          onUpdate={(updates) =>
                            updateSignup.mutate({ signupId: signup.id, updates })
                          }
                          dimmed
                        />
                      ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <Users size={32} className="mx-auto text-slate/40 mb-2" />
          <p className="text-slate text-sm">No signups yet{activeSlot ? " for this slot" : ""}.</p>
        </div>
      )}

      {clinicData.clinician_name && (
        <section className="card p-5 space-y-1">
          <p className="text-xs text-slate uppercase tracking-wider">Clinician</p>
          <p className="font-medium text-charcoal">{clinicData.clinician_name}</p>
          {clinicData.clinician_bio && <p className="text-sm text-slate">{clinicData.clinician_bio}</p>}
        </section>
      )}
    </div>
  );
}

function SignupRow({
  signup,
  onUpdate,
  dimmed,
}: {
  signup: ClinicSignup & { slot_name: string };
  onUpdate: (updates: Partial<Pick<ClinicSignup, "status" | "payment_status" | "ride_time" | "organizer_notes">>) => void;
  dimmed?: boolean;
}) {
  const [editingTime, setEditingTime] = useState(false);
  const [rideTime, setRideTime] = useState(signup.ride_time ?? "");
  const [editingNotes, setEditingNotes] = useState(false);
  const [orgNotes, setOrgNotes] = useState(signup.organizer_notes ?? "");

  const statusColors: Record<string, string> = {
    confirmed: "bg-hunter/10 text-hunter",
    waitlisted: "bg-gold-light text-gold",
    cancelled: "bg-red-50 text-red-500",
  };

  const paymentColors: Record<string, string> = {
    unpaid: "bg-red-50 text-red-500",
    paid: "bg-hunter/10 text-hunter",
    refunded: "bg-mist text-slate",
  };

  return (
    <tr className={dimmed ? "opacity-50" : ""}>
      <td className="px-4 py-3">
        <p className="font-medium text-charcoal">{signup.rider_name}</p>
        <p className="text-xs text-slate">{signup.rider_email}</p>
      </td>
      <td className="px-4 py-3">
        {signup.horses && signup.horses.length > 0 ? (
          <div className="space-y-1">
            {signup.horses.map((sh) => (
              <HorseTag key={sh.id} signupHorse={sh} />
            ))}
          </div>
        ) : (
          <span className="text-charcoal">{signup.horse_name ?? "—"}</span>
        )}
      </td>
      <td className="px-4 py-3 text-charcoal">{signup.slot_name}</td>
      <td className="px-4 py-3">
        <select
          value={signup.status}
          onChange={(e) => onUpdate({ status: e.target.value as ClinicSignup["status"] })}
          className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[signup.status] ?? ""}`}
          disabled={dimmed}
        >
          <option value="confirmed">Confirmed</option>
          <option value="waitlisted">Waitlisted</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <select
          value={signup.payment_status}
          onChange={(e) => onUpdate({ payment_status: e.target.value as ClinicSignup["payment_status"] })}
          className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${paymentColors[signup.payment_status] ?? ""}`}
          disabled={dimmed}
        >
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </select>
      </td>
      <td className="px-4 py-3">
        {signup.horses && signup.horses.length > 0 ? (
          <div className="space-y-1">
            {signup.horses.map((sh) => (
              <p key={sh.id} className="text-xs text-charcoal">
                {sh.ride_time ? formatTimeValue(sh.ride_time) : "—"}
              </p>
            ))}
          </div>
        ) : editingTime ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={rideTime}
              onChange={(e) => setRideTime(e.target.value)}
              className="input text-xs w-24 py-1"
              placeholder="e.g., 10:30 AM"
              autoFocus
            />
            <button
              onClick={() => { onUpdate({ ride_time: rideTime || undefined }); setEditingTime(false); }}
              className="p-0.5 text-hunter"
            >
              <Check size={12} />
            </button>
            <button
              onClick={() => { setRideTime(signup.ride_time ?? ""); setEditingTime(false); }}
              className="p-0.5 text-slate"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingTime(true)}
            className="text-xs text-slate hover:text-hunter transition-colors"
            disabled={dimmed}
          >
            {signup.ride_time || "Set time"}
          </button>
        )}
      </td>
      <td className="px-4 py-3">
        {editingNotes ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={orgNotes}
              onChange={(e) => setOrgNotes(e.target.value)}
              className="input text-xs w-32 py-1"
              placeholder="Notes..."
              autoFocus
            />
            <button
              onClick={() => { onUpdate({ organizer_notes: orgNotes || undefined }); setEditingNotes(false); }}
              className="p-0.5 text-hunter"
            >
              <Check size={12} />
            </button>
            <button
              onClick={() => { setOrgNotes(signup.organizer_notes ?? ""); setEditingNotes(false); }}
              className="p-0.5 text-slate"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingNotes(true)}
            className="text-xs text-slate hover:text-hunter transition-colors max-w-[120px] truncate block"
            disabled={dimmed}
            title={signup.organizer_notes ?? undefined}
          >
            {signup.organizer_notes || "Add note"}
          </button>
        )}
        {signup.rider_notes && (
          <p className="text-xs text-slate/70 mt-0.5 italic truncate max-w-[120px]" title={signup.rider_notes}>
            Rider: {signup.rider_notes}
          </p>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-slate">
        {new Date(signup.created_at).toLocaleDateString()}
      </td>
    </tr>
  );
}

function HorseTag({ signupHorse }: { signupHorse: ClinicSignupHorse }) {
  const horse = signupHorse.horse;
  if (!horse) {
    return <span className="text-xs text-slate/50 italic">Horse removed</span>;
  }

  return (
    <Popover.Root>
      <Popover.Trigger className="text-xs text-hunter hover:underline cursor-pointer flex items-center gap-1">
        {horse.name}
        <Info size={10} className="text-slate" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="bg-white border border-border rounded-lg shadow-lg p-4 w-64 z-50" sideOffset={5}>
          <p className="font-medium text-charcoal text-sm mb-2">{horse.name}</p>
          <div className="space-y-1 text-xs">
            {horse.breed && (
              <p><span className="text-slate">Breed:</span> <span className="text-charcoal">{horse.breed}</span></p>
            )}
            {horse.level && (
              <p><span className="text-slate">Level:</span> <span className="text-charcoal">{horse.level}</span></p>
            )}
            {horse.disciplines && horse.disciplines.length > 0 && (
              <p><span className="text-slate">Disciplines:</span> <span className="text-charcoal">{horse.disciplines.join(", ")}</span></p>
            )}
            {horse.usef_number && (
              <p><span className="text-slate">USEF #:</span> <span className="text-charcoal">{horse.usef_number}</span></p>
            )}
            {horse.usea_number && (
              <p><span className="text-slate">USEA #:</span> <span className="text-charcoal">{horse.usea_number}</span></p>
            )}
            {horse.usdf_number && (
              <p><span className="text-slate">USDF #:</span> <span className="text-charcoal">{horse.usdf_number}</span></p>
            )}
            {!horse.breed && !horse.level && !horse.disciplines?.length && !horse.usef_number && (
              <p className="text-slate italic">No profile details</p>
            )}
          </div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
