"use client";

import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { useFilterStore } from "@/store/filters";
import { useRouter } from "next/navigation";

interface Props {
  onSearch?: () => void;
  variant?: "hero" | "compact";
}

export function SearchBar({ onSearch, variant = "hero" }: Props) {
  const { filters, setFilters } = useFilterStore();
  const [zip, setZip] = useState(filters.zip ?? "");
  const [q, setQ] = useState(filters.q ?? "");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ zip: zip || undefined, q: q || undefined, page: 1 });
    onSearch?.();
    router.push("/search");
  };

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input
            type="text"
            placeholder="Search events..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded bg-white text-charcoal placeholder-slate focus:outline-none focus:border-hunter"
          />
        </div>
        <input
          type="text"
          placeholder="ZIP code"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          className="w-28 px-3 py-2 text-sm border border-border rounded bg-white text-charcoal placeholder-slate focus:outline-none focus:border-hunter"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium bg-hunter text-white rounded hover:bg-hunter-dark transition-colors"
        >
          Search
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto bg-white rounded shadow-card-hover border border-border overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative flex-1 border-b sm:border-b-0 sm:border-r border-border">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" />
          <input
            type="text"
            placeholder="Search by event name, venue..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base text-charcoal placeholder-slate focus:outline-none"
          />
        </div>
        <div className="relative w-full sm:w-44">
          <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate" />
          <input
            type="text"
            placeholder="ZIP code"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base text-charcoal placeholder-slate focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-8 py-4 font-medium bg-hunter text-white hover:bg-hunter-dark transition-colors whitespace-nowrap"
        >
          Find Events
        </button>
      </div>
    </form>
  );
}
