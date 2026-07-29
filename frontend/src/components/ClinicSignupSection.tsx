"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useClinicDetails, useClinicSlotCounts } from "@/hooks/useClinics";
import { useMySignups, useSlotBookedTimes } from "@/hooks/useClinicSignups";
import { ClinicSignupDialog } from "./ClinicSignupDialog";
import { generateTimeBlocks, markAvailability } from "@/lib/timeBlocks";
import { Loader2, Users, Clock } from "lucide-react";
import type { ClinicSlot } from "@/types/clinic";

interface Props {
  eventId: string;
}

export function ClinicSignupSection({ eventId }: Props) {
  const { user, loading: authLoading } = useAuth();
  const { data: clinicData, isLoading } = useClinicDetails(eventId);
  const { data: counts } = useClinicSlotCounts(clinicData?.id);
  const { data: bookedTimesMap } = useSlotBookedTimes(clinicData?.id);
  const { data: mySignups } = useMySignups();
  const [selectedSlot, setSelectedSlot] = useState<ClinicSlot | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="card p-6 flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-hunter" />
      </div>
    );
  }

  if (!clinicData) return null;

  const now = new Date();
  const signupOpen = clinicData.signup_open_date ? new Date(clinicData.signup_open_date) <= now : true;
  const signupClosed = clinicData.signup_close_date ? new Date(clinicData.signup_close_date) < now : false;

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

  const userSignedUpSlots = new Set(
    mySignups
      ?.filter((s) => s.status !== "cancelled")
      .map((s) => s.clinic_slot_id) ?? []
  );

  return (
    <section className="card p-6 space-y-4">
      <h2 className="font-display text-xl text-charcoal">Clinic Registration</h2>

      {clinicData.clinician_name && (
        <div className="pb-3 border-b border-border">
          <p className="text-sm font-medium text-charcoal">{clinicData.clinician_name}</p>
          {clinicData.clinician_bio && (
            <p className="text-sm text-slate mt-0.5">{clinicData.clinician_bio}</p>
          )}
        </div>
      )}

      {clinicData.notes && (
        <p className="text-sm text-slate bg-mist p-3 rounded">{clinicData.notes}</p>
      )}

      {!signupOpen && (
        <div className="flex items-center gap-2 text-sm text-gold">
          <Clock size={14} />
          <span>Signup opens {clinicData.signup_open_date}</span>
        </div>
      )}

      {signupClosed && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <Clock size={14} />
          <span>Signup has closed</span>
        </div>
      )}

      <div className="space-y-3">
        {clinicData.slots.map((slot) => {
          const confirmedCount = counts?.[slot.id] ?? 0;
          const isFull = slot.max_capacity ? confirmedCount >= slot.max_capacity : false;
          const spotsLeft = slot.max_capacity ? slot.max_capacity - confirmedCount : null;
          const alreadySignedUp = userSignedUpSlots.has(slot.id);
          const hasTimeBlocks = !!(slot.duration_minutes && slot.start_time && slot.end_time);
          const slotBookedTimes = bookedTimesMap?.[slot.id] ?? [];
          const availableTimeCount = hasTimeBlocks
            ? markAvailability(
                generateTimeBlocks(slot.start_time!, slot.end_time!, slot.duration_minutes!),
                slotBookedTimes,
                slot.riders_per_lesson ?? 1
              ).filter((b) => b.available).length
            : null;

          return (
            <div key={slot.id} className="border border-border rounded p-4 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-charcoal">{slot.name}</p>
                {slot.description && <p className="text-xs text-slate mt-0.5">{slot.description}</p>}
                <div className="flex items-center gap-3 mt-1">
                  {slot.price_cents ? (
                    <span className="text-sm text-hunter font-medium">{formatPrice(slot.price_cents)}</span>
                  ) : (
                    <span className="text-sm text-slate">Free</span>
                  )}
                  {hasTimeBlocks && availableTimeCount !== null ? (
                    <span className={`text-xs flex items-center gap-1 ${availableTimeCount === 0 ? "text-red-500" : "text-slate"}`}>
                      <Clock size={12} />
                      {availableTimeCount === 0 ? "No times available" : `${availableTimeCount} time${availableTimeCount !== 1 ? "s" : ""} available`}
                    </span>
                  ) : spotsLeft !== null ? (
                    <span className={`text-xs flex items-center gap-1 ${isFull ? "text-red-500" : "text-slate"}`}>
                      <Users size={12} />
                      {isFull ? "Full" : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex-shrink-0 ml-4">
                {authLoading ? (
                  <Loader2 size={16} className="animate-spin text-slate" />
                ) : !user ? (
                  <Link href="/login" className="btn-secondary text-sm">
                    Sign in to register
                  </Link>
                ) : alreadySignedUp ? (
                  <span className="text-sm text-hunter font-medium">Signed up</span>
                ) : !signupOpen || signupClosed ? (
                  <button disabled className="btn-secondary text-sm opacity-50">
                    {signupClosed ? "Closed" : "Not open yet"}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedSlot(slot);
                      setDialogOpen(true);
                    }}
                    className={isFull ? "btn-secondary text-sm" : "btn-primary text-sm"}
                  >
                    {isFull ? "Join Waitlist" : "Sign Up"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedSlot && (
        <ClinicSignupDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          slot={selectedSlot}
          eventId={eventId}
          bookedTimes={bookedTimesMap?.[selectedSlot.id] ?? []}
          isFull={
            selectedSlot.max_capacity
              ? (counts?.[selectedSlot.id] ?? 0) >= selectedSlot.max_capacity
              : false
          }
        />
      )}
    </section>
  );
}
