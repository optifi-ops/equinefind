"use client";

import { useQuery } from "@tanstack/react-query";
import { eventsApi, venuesApi } from "@/lib/api";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: events } = useQuery({
    queryKey: ["admin-events"],
    queryFn: () => eventsApi.list({ per_page: 50 }),
  });

  const { data: venues } = useQuery({
    queryKey: ["admin-venues"],
    queryFn: () => venuesApi.list(),
  });

  const upcoming = events?.items.filter((e) => e.status === "upcoming").length ?? 0;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-charcoal">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Events" value={events?.total ?? "—"} href="/admin/events" />
        <StatCard label="Upcoming" value={upcoming} href="/admin/events" />
        <StatCard label="Venues" value={venues?.length ?? "—"} href="/admin/venues" />
      </div>

      <div className="card p-5">
        <h2 className="font-display text-xl text-charcoal mb-3">Quick Actions</h2>
        <div className="flex gap-3 flex-wrap">
          <Link href="/admin/events/new" className="btn-primary text-sm">+ Add Event</Link>
          <Link href="/admin/venues" className="btn-secondary text-sm">Manage Venues</Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number | string; href: string }) {
  return (
    <Link href={href} className="card p-5 hover:shadow-card-hover transition-shadow block">
      <p className="text-xs text-slate uppercase tracking-wider mb-1">{label}</p>
      <p className="font-display text-3xl text-charcoal">{value}</p>
    </Link>
  );
}
