import { create } from "zustand";
import type { EventFilters } from "@/types/event";

interface FilterStore {
  filters: EventFilters;
  setFilters: (f: Partial<EventFilters>) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: EventFilters = {
  radius: 100,
  sort: "date_asc",
  page: 1,
  per_page: 20,
};

export const useFilterStore = create<FilterStore>((set) => ({
  filters: DEFAULT_FILTERS,
  setFilters: (f) => set((state) => ({ filters: { ...state.filters, ...f, page: 1 } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
