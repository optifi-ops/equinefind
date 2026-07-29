"use client";

import { cn } from "@/lib/utils";
import { useFilterStore } from "@/store/filters";

const CHIPS = [
  { value: "show_jumping", label: "Show Jumping" },
  { value: "eventing",     label: "Eventing" },
  { value: "dressage",     label: "Dressage" },
  { value: "hunters",      label: "Hunters" },
  { value: "equitation",   label: "Equitation" },
];

export function DisciplineChips() {
  const { filters, setFilters } = useFilterStore();
  const selected = filters.disciplines ?? [];

  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((d) => d !== value)
      : [...selected, value];
    setFilters({ disciplines: next.length ? next : undefined });
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {CHIPS.map((chip) => {
        const active = selected.includes(chip.value);
        return (
          <button
            key={chip.value}
            onClick={() => toggle(chip.value)}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded border transition-colors",
              active
                ? "bg-hunter text-white border-hunter"
                : "bg-white text-charcoal border-border hover:border-hunter hover:text-hunter"
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
