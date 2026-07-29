"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useSavedEvents } from "@/hooks/useSavedEvents";
import { useHorses } from "@/hooks/useHorses";
import { useMySignups } from "@/hooks/useClinicSignups";
import { CalendarDays, Heart, ClipboardList, ArrowRight } from "lucide-react";

export default function AccountDashboard() {
  const { profile, isOrganizer } = useAuth();
  const { data: savedEvents } = useSavedEvents();
  const { data: horses } = useHorses();
  const { data: mySignups } = useMySignups();

  const upcomingEvents = savedEvents?.filter(
    (e) => new Date(e.start_date) >= new Date()
  ) ?? [];
  const activeSignups = mySignups?.filter(
    (s) => s.status !== "cancelled" && new Date(s.start_date) >= new Date()
  ) ?? [];
  const nextEvent = upcomingEvents[0];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl text-charcoal">Dashboard</h1>
        <p className="text-slate text-sm mt-1">
          Welcome back{profile?.display_name ? `, ${profile.display_name}` : ""}
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/account/events" className="card p-5 hover:shadow-card-hover transition-shadow">
          <div className="flex items-center gap-3">
            <CalendarDays size={20} className="text-hunter" />
            <div>
              <p className="text-2xl font-semibold text-charcoal">{upcomingEvents.length}</p>
              <p className="text-xs text-slate">Upcoming Events</p>
            </div>
          </div>
        </Link>
        <Link href="/account/events" className="card p-5 hover:shadow-card-hover transition-shadow">
          <div className="flex items-center gap-3">
            <ClipboardList size={20} className="text-hunter" />
            <div>
              <p className="text-2xl font-semibold text-charcoal">{activeSignups.length}</p>
              <p className="text-xs text-slate">Active Signups</p>
            </div>
          </div>
        </Link>
        <Link href="/account/horses" className="card p-5 hover:shadow-card-hover transition-shadow">
          <div className="flex items-center gap-3">
            <Heart size={20} className="text-hunter" />
            <div>
              <p className="text-2xl font-semibold text-charcoal">{horses?.length ?? 0}</p>
              <p className="text-xs text-slate">Horses</p>
            </div>
          </div>
        </Link>
      </div>

      {nextEvent && (
        <section className="card p-5">
          <p className="text-xs text-slate uppercase tracking-wider mb-2">Next Event</p>
          <Link href={`/events/${nextEvent.slug}`} className="font-medium text-charcoal hover:text-hunter">
            {nextEvent.title}
          </Link>
          <p className="text-sm text-slate mt-0.5">{nextEvent.start_date}</p>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href="/account/events" className="btn-secondary inline-flex items-center gap-2 text-sm">
          <CalendarDays size={16} />
          My Events
          <ArrowRight size={14} />
        </Link>
        <Link href="/account/horses" className="btn-secondary inline-flex items-center gap-2 text-sm">
          <Heart size={16} />
          My Horses
          <ArrowRight size={14} />
        </Link>
        {isOrganizer && (
          <Link href="/account/clinics" className="btn-primary inline-flex items-center gap-2 text-sm">
            <ClipboardList size={16} />
            Manage Clinics
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}
