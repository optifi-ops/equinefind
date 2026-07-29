"use client";

import { useState } from "react";
import Link from "next/link";
import { useSavedEvents } from "@/hooks/useSavedEvents";
import { useHorses } from "@/hooks/useHorses";
import { useMySignups, useCancelSignup } from "@/hooks/useClinicSignups";
import { CalendarView } from "@/components/CalendarView";
import { SavedEventRow } from "@/components/SavedEventRow";
import { CalendarDays, Loader2, XCircle } from "lucide-react";
import type { Horse } from "@/types/horse";

export default function AccountEventsPage() {
  const { data: savedEvents, isLoading } = useSavedEvents();
  const { data: horses } = useHorses();
  const { data: mySignups } = useMySignups();
  const cancelSignup = useCancelSignup();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-hunter" />
      </div>
    );
  }

  const horsesById = new Map<string, Horse>();
  horses?.forEach((h) => horsesById.set(h.id, h));

  const activeSignups = mySignups?.filter(
    (s) => s.status !== "cancelled" && new Date(s.start_date) >= new Date()
  ) ?? [];
  const pastSignups = mySignups?.filter(
    (s) => s.status === "cancelled" || new Date(s.start_date) < new Date()
  ) ?? [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-charcoal">My Events</h1>
        <p className="text-slate text-sm mt-1">Saved events and clinic signups</p>
      </header>

      {savedEvents && savedEvents.length > 0 ? (
        <>
          <CalendarView events={savedEvents} />

          <section className="space-y-3">
            <h2 className="font-display text-lg text-charcoal">Saved Events</h2>
            <div className="space-y-2">
              {savedEvents.map((event) => (
                <SavedEventRow
                  key={event.id}
                  event={event}
                  horsesById={horsesById}
                  allHorses={horses ?? []}
                />
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="card p-12 text-center space-y-3">
          <CalendarDays size={48} className="mx-auto text-slate/40" />
          <p className="text-slate">You haven&apos;t saved any events yet.</p>
          <Link href="/search" className="btn-primary inline-flex">
            Browse Events
          </Link>
        </div>
      )}

      {activeSignups.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg text-charcoal">Clinic Signups</h2>
          {cancelError && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              Failed to cancel: {cancelError}
            </div>
          )}
          <div className="space-y-2">
            {activeSignups.map((signup) => (
              <div key={signup.id} className="card p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <Link href={`/events/${signup.event_slug}`} className="text-sm font-medium text-charcoal hover:text-hunter">
                    {signup.event_title}
                  </Link>
                  <p className="text-xs text-slate">
                    {signup.start_date} {"•"} {signup.slot_name}
                    {signup.horse_name && ` • ${signup.horse_name}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    signup.status === "confirmed" ? "bg-hunter/10 text-hunter" : "bg-gold-light text-gold"
                  }`}>
                    {signup.status}
                  </span>
                  {confirmingId === signup.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setCancelError(null);
                          cancelSignup.mutate(signup.id, {
                            onSuccess: () => setConfirmingId(null),
                            onError: (err) => {
                              setCancelError((err as Error).message);
                              setConfirmingId(null);
                            },
                          });
                        }}
                        disabled={cancelSignup.isPending}
                        className="text-xs px-2 py-0.5 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        {cancelSignup.isPending ? "..." : "Confirm"}
                      </button>
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="text-xs px-2 py-0.5 text-slate hover:text-charcoal"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingId(signup.id)}
                      className="p-1 text-slate hover:text-red-500 transition-colors"
                      title="Cancel signup"
                    >
                      <XCircle size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {pastSignups.length > 0 && (
        <details className="text-sm">
          <summary className="text-slate cursor-pointer hover:text-charcoal">
            Past &amp; cancelled signups ({pastSignups.length})
          </summary>
          <div className="space-y-2 mt-2 opacity-60">
            {pastSignups.map((signup) => (
              <div key={signup.id} className="card p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal">{signup.event_title}</p>
                  <p className="text-xs text-slate">{signup.start_date} {"•"} {signup.slot_name}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  signup.status === "cancelled" ? "bg-red-50 text-red-500" : "bg-mist text-slate"
                }`}>
                  {signup.status === "cancelled" ? "cancelled" : "past"}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
