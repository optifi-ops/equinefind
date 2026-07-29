"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { Horse } from "@/types/horse";

const DISCIPLINES = [
  { value: "show_jumping", label: "Show Jumping" },
  { value: "eventing", label: "Eventing" },
  { value: "dressage", label: "Dressage" },
  { value: "hunters", label: "Hunters" },
  { value: "equitation", label: "Equitation" },
];

const LEVELS = [
  "Beginner Novice",
  "Novice",
  "Training",
  "Modified",
  "Preliminary",
  "Intermediate",
  "Advanced",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  horse?: Horse;
  onSubmit: (data: Omit<Horse, "id" | "user_id" | "created_at">) => void;
  loading?: boolean;
}

export function HorseFormDialog({ open, onOpenChange, horse, onSubmit, loading }: Props) {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [usefNumber, setUsefNumber] = useState("");
  const [useaNumber, setUseaNumber] = useState("");
  const [usdfNumber, setUsdfNumber] = useState("");
  const [level, setLevel] = useState("");
  const [disciplines, setDisciplines] = useState<string[]>([]);

  useEffect(() => {
    if (horse) {
      setName(horse.name);
      setBreed(horse.breed ?? "");
      setUsefNumber(horse.usef_number ?? "");
      setUseaNumber(horse.usea_number ?? "");
      setUsdfNumber(horse.usdf_number ?? "");
      setLevel(horse.level ?? "");
      setDisciplines(horse.disciplines ?? []);
    } else {
      setName("");
      setBreed("");
      setUsefNumber("");
      setUseaNumber("");
      setUsdfNumber("");
      setLevel("");
      setDisciplines([]);
    }
  }, [horse, open]);

  const toggleDisc = (v: string) => {
    setDisciplines((prev) =>
      prev.includes(v) ? prev.filter((d) => d !== v) : [...prev, v]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      breed: breed || undefined,
      usef_number: usefNumber || undefined,
      usea_number: useaNumber || undefined,
      usdf_number: usdfNumber || undefined,
      level: level || undefined,
      disciplines,
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto z-50">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="font-display text-xl text-charcoal">
              {horse ? "Edit Horse" : "Add Horse"}
            </Dialog.Title>
            <Dialog.Close className="text-slate hover:text-charcoal">
              <X size={18} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input"
                placeholder="e.g. Whiskey"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Breed</label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="input"
                placeholder="e.g. Thoroughbred"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Disciplines</label>
              <div className="flex flex-wrap gap-2">
                {DISCIPLINES.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDisc(d.value)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      disciplines.includes(d.value)
                        ? "bg-hunter text-white border-hunter"
                        : "bg-white text-slate border-border hover:border-hunter"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="input"
              >
                <option value="">Select level</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs text-slate uppercase tracking-wider mb-3">Membership Numbers</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1">USEF #</label>
                  <input
                    type="text"
                    value={usefNumber}
                    onChange={(e) => setUsefNumber(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1">USEA #</label>
                  <input
                    type="text"
                    value={useaNumber}
                    onChange={(e) => setUseaNumber(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1">USDF #</label>
                  <input
                    type="text"
                    value={usdfNumber}
                    onChange={(e) => setUsdfNumber(e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Dialog.Close asChild>
                <button type="button" className="btn-secondary flex-1">Cancel</button>
              </Dialog.Close>
              <button type="submit" disabled={loading || !name.trim()} className="btn-primary flex-1">
                {loading ? "Saving..." : horse ? "Save Changes" : "Add Horse"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
