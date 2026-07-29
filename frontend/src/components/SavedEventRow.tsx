"use client";

import { useState } from "react";
import Link from "next/link";
import { useSetSavedEventHorses } from "@/hooks/useSavedEventHorses";
import { formatDateRange, formatDiscipline } from "@/lib/utils";
import { Pencil, Check, X } from "lucide-react";
import type { Horse } from "@/types/horse";

interface Props {
  event: {
    id: string;
    slug: string;
    title: string;
    start_date: string;
    end_date: string;
    disciplines: string[];
    saved_event_id: string;
    horse_ids: string[];
  };
  horsesById: Map<string, Horse>;
  allHorses: Horse[];
}

export function SavedEventRow({ event, horsesById, allHorses }: Props) {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<string[]>(event.horse_ids);
  const setHorsesMutation = useSetSavedEventHorses(event.saved_event_id);

  const assignedHorses = event.horse_ids
    .map((id) => horsesById.get(id))
    .filter(Boolean) as Horse[];

  const toggleHorse = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    setHorsesMutation.mutate(selected, {
      onSuccess: () => setEditing(false),
    });
  };

  return (
    <div className="card p-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <Link href={`/events/${event.slug}`} className="text-sm font-medium text-charcoal hover:text-hunter">
          {event.title}
        </Link>
        <p className="text-xs text-slate">
          {formatDateRange(event.start_date, event.end_date)}
          {event.disciplines.length > 0 && ` • ${event.disciplines.map(formatDiscipline).join(", ")}`}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {editing ? (
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-1">
              {allHorses.map((horse) => (
                <button
                  key={horse.id}
                  onClick={() => toggleHorse(horse.id)}
                  className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                    selected.includes(horse.id)
                      ? "bg-hunter text-white border-hunter"
                      : "bg-white text-slate border-border"
                  }`}
                >
                  {horse.name}
                </button>
              ))}
            </div>
            <button
              onClick={handleSave}
              disabled={setHorsesMutation.isPending}
              className="p-1 text-hunter hover:text-hunter-dark"
              title="Save"
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => { setEditing(false); setSelected(event.horse_ids); }}
              className="p-1 text-slate hover:text-charcoal"
              title="Cancel"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            {assignedHorses.length > 0 ? (
              <div className="flex gap-1">
                {assignedHorses.map((horse) => (
                  <span key={horse.id} className="px-2 py-0.5 text-xs bg-hunter/10 text-hunter rounded-full">
                    {horse.name}
                  </span>
                ))}
              </div>
            ) : allHorses.length > 0 ? (
              <span className="text-xs text-slate">No horses assigned</span>
            ) : null}
            {allHorses.length > 0 && (
              <button
                onClick={() => { setSelected(event.horse_ids); setEditing(true); }}
                className="p-1 text-slate hover:text-hunter transition-colors"
                title="Edit horses"
              >
                <Pencil size={12} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
