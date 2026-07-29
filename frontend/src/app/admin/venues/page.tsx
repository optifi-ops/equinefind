"use client";

import { useQuery } from "@tanstack/react-query";
import { venuesApi } from "@/lib/api";
import Link from "next/link";
import type { Venue } from "@/types/venue";

export default function AdminVenuesPage() {
  const { data: venues, isLoading } = useQuery<Venue[]>({
    queryKey: ["venues-admin"],
    queryFn: () => venuesApi.list(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-charcoal">Venues</h1>
      </div>

      {isLoading && <p className="text-sm text-slate">Loading...</p>}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-mist border-b border-border">
            <tr>
              {["Name", "City", "State", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {venues?.map((v) => (
              <tr key={v.id} className="hover:bg-mist/50">
                <td className="px-4 py-3 font-medium text-charcoal">{v.name}</td>
                <td className="px-4 py-3 text-slate">{v.city}</td>
                <td className="px-4 py-3 text-slate">{v.state}</td>
                <td className="px-4 py-3">
                  <Link href={`/venues/${v.slug}`} className="text-xs text-hunter hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!venues?.length && !isLoading && (
          <p className="px-4 py-8 text-center text-sm text-slate">No venues found.</p>
        )}
      </div>
    </div>
  );
}
