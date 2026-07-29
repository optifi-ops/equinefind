"use client";

import { useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useHorses } from "@/hooks/useHorses";
import { useCreateSignup } from "@/hooks/useClinicSignups";
import { generateTimeBlocks, markAvailability, formatTimeValue } from "@/lib/timeBlocks";
import type { ClinicSlot } from "@/types/clinic";
import type { Horse } from "@/types/horse";

type Step = "horses" | "times" | "confirm";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: ClinicSlot;
  isFull: boolean;
  eventId?: string;
  bookedTimes?: string[];
}

export function ClinicSignupDialog({ open, onOpenChange, slot, isFull, eventId, bookedTimes = [] }: Props) {
  const { user, profile } = useAuth();
  const { data: horses } = useHorses();
  const createSignup = useCreateSignup(eventId);

  const [step, setStep] = useState<Step>("horses");
  const [selectedHorseIds, setSelectedHorseIds] = useState<string[]>([]);
  const [horseTimeMap, setHorseTimeMap] = useState<Record<string, string>>({});
  const [riderNotes, setRiderNotes] = useState("");

  const hasTimeBlocks = !!(slot.duration_minutes && slot.start_time && slot.end_time);

  const timeBlocks = useMemo(() => {
    if (!hasTimeBlocks) return [];
    return generateTimeBlocks(slot.start_time!, slot.end_time!, slot.duration_minutes!);
  }, [hasTimeBlocks, slot.start_time, slot.end_time, slot.duration_minutes]);

  const selectedHorses = useMemo(
    () => (horses ?? []).filter((h) => selectedHorseIds.includes(h.id)),
    [horses, selectedHorseIds]
  );

  const alreadyPickedTimes = Object.values(horseTimeMap);

  const getAvailableBlocks = (excludeHorseId?: string) => {
    const otherPickedTimes = Object.entries(horseTimeMap)
      .filter(([hId]) => hId !== excludeHorseId)
      .map(([, t]) => t);
    const allBooked = [...bookedTimes, ...otherPickedTimes];
    return markAvailability(timeBlocks, allBooked, slot.riders_per_lesson ?? 1);
  };

  const resetState = () => {
    setStep("horses");
    setSelectedHorseIds([]);
    setHorseTimeMap({});
    setRiderNotes("");
  };

  const handleClose = (open: boolean) => {
    if (!open) resetState();
    onOpenChange(open);
  };

  const toggleHorse = (id: string) => {
    setSelectedHorseIds((prev) => {
      const next = prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id];
      if (!next.includes(id)) {
        setHorseTimeMap((m) => { const { [id]: _, ...rest } = m; return rest; });
      }
      return next;
    });
  };

  const handleNext = () => {
    if (step === "horses") {
      setStep(hasTimeBlocks ? "times" : "confirm");
    } else if (step === "times") {
      setStep("confirm");
    }
  };

  const handleBack = () => {
    if (step === "confirm") {
      setStep(hasTimeBlocks ? "times" : "horses");
    } else if (step === "times") {
      setStep("horses");
    }
  };

  const canAdvance = () => {
    if (step === "horses") return selectedHorseIds.length > 0;
    if (step === "times") return selectedHorseIds.every((id) => horseTimeMap[id]);
    return true;
  };

  const handleSubmit = () => {
    if (!user) return;

    createSignup.mutate(
      {
        clinic_slot_id: slot.id,
        rider_name: profile?.display_name || profile?.compete_name || user.email || "",
        rider_email: user.email || "",
        rider_notes: riderNotes || undefined,
        status: isFull ? "waitlisted" : "confirmed",
        horses: selectedHorses.map((h) => ({
          horse_id: h.id,
          horse_name: h.name,
          ride_time: horseTimeMap[h.id] || undefined,
        })),
      },
      {
        onSuccess: () => {
          handleClose(false);
        },
      }
    );
  };

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-xl z-50 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="font-display text-xl text-charcoal">
              {isFull ? "Join Waitlist" : "Sign Up"} — {slot.name}
            </Dialog.Title>
            <Dialog.Close className="text-slate hover:text-charcoal">
              <X size={18} />
            </Dialog.Close>
          </div>

          {/* Slot info bar */}
          <div className="mb-4 p-3 bg-mist rounded flex items-center justify-between">
            <div>
              <p className="font-medium text-charcoal text-sm">{slot.name}</p>
              {slot.description && <p className="text-xs text-slate mt-0.5">{slot.description}</p>}
            </div>
            {slot.price_cents && (
              <p className="text-sm text-hunter font-medium">{formatPrice(slot.price_cents)}</p>
            )}
          </div>

          {isFull && (
            <p className="text-xs text-gold font-medium mb-4">This slot is full. You will be added to the waitlist.</p>
          )}

          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-5">
            {["horses", ...(hasTimeBlocks ? ["times"] : []), "confirm"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className="w-6 h-px bg-border" />}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  s === step ? "bg-hunter text-white" :
                  (["horses", "times", "confirm"].indexOf(s) < ["horses", "times", "confirm"].indexOf(step))
                    ? "bg-hunter/20 text-hunter" : "bg-mist text-slate"
                }`}>
                  {i + 1}
                </div>
                <span className={`text-xs ${s === step ? "text-charcoal font-medium" : "text-slate"}`}>
                  {s === "horses" ? "Horses" : s === "times" ? "Times" : "Confirm"}
                </span>
              </div>
            ))}
          </div>

          {/* Step 1: Select Horses */}
          {step === "horses" && (
            <div className="space-y-2">
              <p className="text-sm text-slate mb-3">Select the horse(s) you&apos;re bringing:</p>
              {horses && horses.length > 0 ? (
                horses.map((horse) => (
                  <button
                    key={horse.id}
                    type="button"
                    onClick={() => toggleHorse(horse.id)}
                    className={`w-full text-left p-3 rounded border transition-colors flex items-center justify-between ${
                      selectedHorseIds.includes(horse.id)
                        ? "border-hunter bg-hunter/5"
                        : "border-border hover:border-hunter/50"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-charcoal text-sm">{horse.name}</p>
                      <p className="text-xs text-slate">
                        {[horse.breed, horse.level].filter(Boolean).join(" • ") || "No details"}
                      </p>
                    </div>
                    {selectedHorseIds.includes(horse.id) && (
                      <Check size={16} className="text-hunter flex-shrink-0" />
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-slate">No horses in your profile yet.</p>
                  <p className="text-xs text-slate mt-1">Add horses in Account → My Horses first.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Pick Times */}
          {step === "times" && (
            <div className="space-y-5">
              <p className="text-sm text-slate">Pick a time for each horse:</p>
              {selectedHorses.map((horse) => {
                const available = getAvailableBlocks(horse.id);
                return (
                  <div key={horse.id}>
                    <p className="text-sm font-medium text-charcoal mb-2">{horse.name}</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {available.map((block) => {
                        const isSelected = horseTimeMap[horse.id] === block.value;
                        const isPickedByOther = !isSelected && alreadyPickedTimes.includes(block.value) &&
                          (slot.riders_per_lesson ?? 1) <= 1;
                        const disabled = !block.available || isPickedByOther;
                        return (
                          <button
                            key={block.value}
                            type="button"
                            disabled={disabled}
                            onClick={() =>
                              setHorseTimeMap((m) => ({
                                ...m,
                                [horse.id]: isSelected ? "" : block.value,
                              }))
                            }
                            className={`px-3 py-2 text-sm rounded border transition-colors ${
                              isSelected
                                ? "bg-hunter text-white border-hunter"
                                : disabled
                                ? "bg-mist text-slate/40 border-border cursor-not-allowed"
                                : "bg-white text-charcoal border-border hover:border-hunter"
                            }`}
                          >
                            {block.time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === "confirm" && (
            <div className="space-y-4">
              <div className="space-y-2">
                {selectedHorses.map((horse) => (
                  <div key={horse.id} className="flex items-center justify-between p-2 bg-mist rounded">
                    <span className="text-sm font-medium text-charcoal">{horse.name}</span>
                    {horseTimeMap[horse.id] && (
                      <span className="text-sm text-hunter">{formatTimeValue(horseTimeMap[horse.id])}</span>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Notes for Organizer</label>
                <textarea
                  value={riderNotes}
                  onChange={(e) => setRiderNotes(e.target.value)}
                  rows={2}
                  className="input"
                  placeholder="Any special requests or info..."
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-2 mt-6">
            {step !== "horses" && (
              <button type="button" onClick={handleBack} className="btn-secondary flex items-center gap-1">
                <ChevronLeft size={14} />
                Back
              </button>
            )}
            <div className="flex-1" />
            {step === "confirm" ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={createSignup.isPending || selectedHorseIds.length === 0}
                className="btn-primary flex items-center gap-1"
              >
                {createSignup.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isFull ? (
                  "Join Waitlist"
                ) : (
                  "Sign Up"
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canAdvance()}
                className="btn-primary flex items-center gap-1"
              >
                Next
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
