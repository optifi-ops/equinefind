"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useOrganizerClinics } from "@/hooks/useClinics";
import { formatDateRange, formatDiscipline } from "@/lib/utils";
import { Loader2, CalendarPlus, ClipboardList, Users, AlertCircle } from "lucide-react";

export default function AccountClinicsPage() {
  const { isOrganizer } = useAuth();
  const { data: clinics, isLoading } = useOrganizerClinics();

  if (!isOrganizer) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-hunter" />
      </div>
    );
  }

  const upcoming = clinics?.filter((c) => new Date(c.start_date) >= new Date()) ?? [];
  const totalClinics = clinics?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-charcoal">My Clinics</h1>
          <p className="text-slate text-sm mt-1">{totalClinics} clinic{totalClinics !== 1 ? "s" : ""} total, {upcoming.length} upcoming</p>
        </div>
        <Link href="/account/clinics/new" className="btn-primary inline-flex items-center gap-2">
          <CalendarPlus size={16} />
          New Clinic
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <ClipboardList size={20} className="text-hunter" />
            <div>
              <p className="text-2xl font-semibold text-charcoal">{totalClinics}</p>
              <p className="text-xs text-slate">Total Clinics</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <CalendarPlus size={20} className="text-hunter" />
            <div>
              <p className="text-2xl font-semibold text-charcoal">{upcoming.length}</p>
              <p className="text-xs text-slate">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-hunter" />
            <div>
              <p className="text-2xl font-semibold text-charcoal">-</p>
              <p className="text-xs text-slate">Total Signups</p>
            </div>
          </div>
        </div>
      </div>

      {clinics && clinics.length > 0 ? (
        <div className="space-y-3">
          {clinics.map((clinic) => {
            const isPast = new Date(clinic.end_date) < new Date();
            return (
              <Link
                key={clinic.id}
                href={`/account/clinics/${clinic.id}`}
                className={`card p-4 flex items-center justify-between hover:shadow-card-hover transition-shadow block ${isPast ? "opacity-60" : ""}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-charcoal truncate">{clinic.title}</p>
                    {clinic.status === "cancelled" && (
                      <span className="px-1.5 py-0.5 text-xs bg-red-50 text-red-600 rounded">Cancelled</span>
                    )}
                    {isPast && (
                      <span className="px-1.5 py-0.5 text-xs bg-mist text-slate rounded">Past</span>
                    )}
                  </div>
                  <p className="text-sm text-slate">
                    {formatDateRange(clinic.start_date, clinic.end_date)}
                    {clinic.venue && ` • ${clinic.venue.name}`}
                  </p>
                  {clinic.disciplines.length > 0 && (
                    <p className="text-xs text-slate mt-0.5">
                      {clinic.disciplines.map(formatDiscipline).join(", ")}
                    </p>
                  )}
                </div>
                <span className="text-xs text-hunter font-medium flex-shrink-0 ml-4">Manage &rarr;</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center space-y-3">
          <AlertCircle size={48} className="mx-auto text-slate/40" />
          <p className="text-slate">You haven&apos;t created any clinics yet.</p>
          <Link href="/account/clinics/new" className="btn-primary inline-flex items-center gap-2">
            <CalendarPlus size={16} />
            Create Your First Clinic
          </Link>
        </div>
      )}
    </div>
  );
}
