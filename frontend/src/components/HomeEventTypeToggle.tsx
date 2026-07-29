"use client";

import { useFilterStore } from "@/store/filters";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { label: "All", value: null },
  { label: "Recognized", value: "recognized" },
  { label: "Schooling", value: "schooling" },
] as const;

export function HomeEventTypeToggle() {
  const { filters, setFilters } = useFilterStore();
  const current = filters.event_type ?? [];

  const isActive = (value: string | null) =>
    value === null ? current.length === 0 : current.length === 1 && current[0] === value;

  const select = (value: string | null) =>
    setFilters({ event_type: value === null ? undefined : [value] });

  return (
    <div className="flex justify-center mt-4 mb-8">
      <div className="inline-flex">
        {OPTIONS.map(({ label, value }, i) => (
          <button
            key={label}
            onClick={() => select(value)}
            aria-pressed={isActive(value)}
            className={cn(
              "px-5 py-2 text-sm font-medium border border-hunter transition-colors",
              i === 0 && "rounded-l",
              i === OPTIONS.length - 1 && "rounded-r",
              i !== 0 && "-ml-px",
              isActive(value)
                ? "bg-hunter text-white"
                : "bg-white text-charcoal hover:text-hunter"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
