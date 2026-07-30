"use client";

import { useState } from "react";
import { useHorses, useCreateHorse, useUpdateHorse, useDeleteHorse } from "@/hooks/useHorses";
import { HorseFormDialog } from "@/components/HorseFormDialog";
import { formatDiscipline, horseAgeLabel } from "@/lib/utils";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Horse } from "@/types/horse";

export default function AccountHorsesPage() {
  const { data: horses, isLoading } = useHorses();
  const createHorse = useCreateHorse();
  const updateHorse = useUpdateHorse();
  const deleteHorse = useDeleteHorse();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHorse, setEditingHorse] = useState<Horse | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-hunter" />
      </div>
    );
  }

  const handleCreate = (data: Omit<Horse, "id" | "user_id" | "created_at">) => {
    createHorse.mutate(data, {
      onSuccess: () => setDialogOpen(false),
    });
  };

  const handleUpdate = (data: Omit<Horse, "id" | "user_id" | "created_at">) => {
    if (!editingHorse) return;
    updateHorse.mutate(
      { id: editingHorse.id, ...data },
      { onSuccess: () => { setEditingHorse(undefined); setDialogOpen(false); } }
    );
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteHorse.mutate(id, {
      onSuccess: () => setConfirmingId(null),
      onSettled: () => setDeletingId(null),
    });
  };

  const openAdd = () => {
    setEditingHorse(undefined);
    setDialogOpen(true);
  };

  const openEdit = (horse: Horse) => {
    setEditingHorse(horse);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-charcoal">My Horses</h1>
          <p className="text-slate text-sm mt-1">{horses?.length ?? 0} horse{horses?.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm inline-flex items-center gap-1.5">
          <Plus size={14} />
          Add Horse
        </button>
      </div>

      {horses && horses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {horses.map((horse) => (
            <div key={horse.id} className="card p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-charcoal">{horse.name}</h3>
                  {horse.registered_name && (
                    <p className="text-xs text-slate italic">{horse.registered_name}</p>
                  )}
                  {(horseAgeLabel(horse.birth_year) || horse.gender || horse.breed) && (
                    <p className="text-sm text-slate">
                      {[horseAgeLabel(horse.birth_year), horse.gender, horse.breed]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  )}
                </div>
                {confirmingId === horse.id ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate">Remove?</span>
                    <button
                      onClick={() => handleDelete(horse.id)}
                      disabled={deletingId === horse.id}
                      className="text-xs px-2 py-0.5 bg-red-500 text-white rounded hover:bg-red-600"
                      title="This horse will also be removed from any saved events."
                    >
                      {deletingId === horse.id ? "..." : "Yes"}
                    </button>
                    <button
                      onClick={() => setConfirmingId(null)}
                      className="text-xs px-2 py-0.5 text-slate hover:text-charcoal"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(horse)}
                      className="p-1.5 text-slate hover:text-hunter transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setConfirmingId(horse.id)}
                      className="p-1.5 text-slate hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {horse.disciplines.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {horse.disciplines.map((d) => (
                    <span key={d} className="px-2 py-0.5 text-xs bg-mist text-slate rounded-full">
                      {formatDiscipline(d)}
                    </span>
                  ))}
                </div>
              )}

              {(horse.usef_number || horse.usea_number || horse.usdf_number) && (
                <div className="text-xs text-slate space-y-0.5 pt-1 border-t border-border">
                  {horse.usef_number && <p>USEF: {horse.usef_number}</p>}
                  {horse.usea_number && <p>USEA: {horse.usea_number}</p>}
                  {horse.usdf_number && <p>USDF: {horse.usdf_number}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center space-y-3">
          <p className="text-slate">No horses added yet.</p>
          <button onClick={openAdd} className="btn-primary inline-flex items-center gap-1.5">
            <Plus size={14} />
            Add Your First Horse
          </button>
        </div>
      )}

      <HorseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        horse={editingHorse}
        onSubmit={editingHorse ? handleUpdate : handleCreate}
        loading={createHorse.isPending || updateHorse.isPending}
      />
    </div>
  );
}
