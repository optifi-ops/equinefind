"use client";

import { useState } from "react";
import Link from "next/link";
import * as Popover from "@radix-ui/react-popover";
import { useAuth } from "@/hooks/useAuth";
import { useIsEventSaved, useToggleSaveEvent } from "@/hooks/useSavedEvents";
import { useHorses } from "@/hooks/useHorses";
import { savedEventHorsesApi } from "@/lib/api";
import { CalendarPlus, CalendarCheck, Loader2, X } from "lucide-react";

interface Props {
  eventId: string;
}

export function SaveEventButton({ eventId }: Props) {
  const { user, loading: authLoading } = useAuth();
  const { data: saveStatus, isLoading } = useIsEventSaved(eventId);
  const { saveMutation, unsaveMutation } = useToggleSaveEvent(eventId);
  const { data: horses } = useHorses();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedHorses, setSelectedHorses] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  if (!authLoading && !user) {
    return (
      <Link
        href="/login"
        className="btn-secondary inline-flex items-center gap-2 text-sm"
      >
        <CalendarPlus size={16} />
        Add to My Calendar
      </Link>
    );
  }

  if (authLoading || isLoading) {
    return (
      <button disabled className="btn-secondary inline-flex items-center gap-2 text-sm opacity-60">
        <Loader2 size={16} className="animate-spin" />
        Add to My Calendar
      </button>
    );
  }

  const isSaved = saveStatus?.saved ?? false;
  const hasHorses = horses && horses.length > 0;
  const busy = saveMutation.isPending || unsaveMutation.isPending || saving;

  const handleClick = () => {
    if (hasHorses) {
      setSelectedHorses([]);
      setPickerOpen(true);
    } else {
      saveMutation.mutate();
    }
  };

  const handleSaveWithHorses = async () => {
    setSaving(true);
    try {
      const savedEventId = await saveMutation.mutateAsync();
      if (selectedHorses.length > 0) {
        await savedEventHorsesApi.setForEvent(savedEventId, selectedHorses);
      }
    } finally {
      setSaving(false);
      setPickerOpen(false);
    }
  };

  const toggleHorse = (horseId: string) => {
    setSelectedHorses((prev) =>
      prev.includes(horseId) ? prev.filter((id) => id !== horseId) : [...prev, horseId]
    );
  };

  if (isSaved) {
    return (
      <button
        onClick={() => unsaveMutation.mutate()}
        disabled={busy}
        className="btn-secondary inline-flex items-center gap-2 text-sm text-hunter border-hunter"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <CalendarCheck size={16} />}
        Saved to My Calendar
      </button>
    );
  }

  return (
    <Popover.Root open={pickerOpen} onOpenChange={setPickerOpen}>
      <Popover.Anchor>
        <button
          onClick={handleClick}
          disabled={busy}
          className="btn-secondary inline-flex items-center gap-2 text-sm"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <CalendarPlus size={16} />}
          Add to My Calendar
        </button>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          className="bg-white border border-border rounded shadow-lg p-4 w-64 z-50"
          sideOffset={8}
          align="end"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-charcoal">Which horses are going?</p>
            <Popover.Close className="text-slate hover:text-charcoal">
              <X size={14} />
            </Popover.Close>
          </div>
          <div className="space-y-2 mb-3">
            {horses?.map((horse) => (
              <label key={horse.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedHorses.includes(horse.id)}
                  onChange={() => toggleHorse(horse.id)}
                  className="rounded border-border text-hunter focus:ring-hunter"
                />
                <span className="text-charcoal">{horse.name}</span>
                {horse.breed && <span className="text-slate text-xs">({horse.breed})</span>}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setPickerOpen(false); saveMutation.mutate(); }}
              className="btn-secondary text-xs py-1.5 flex-1"
            >
              Skip
            </button>
            <button
              onClick={handleSaveWithHorses}
              disabled={saving || selectedHorses.length === 0}
              className="btn-primary text-xs py-1.5 flex-1"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
