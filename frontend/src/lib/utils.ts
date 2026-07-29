import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateRange(start: string, end: string): string {
  const s = parseISO(start);
  const e = parseISO(end);
  if (start === end) return format(s, "MMMM d, yyyy");
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${format(s, "MMMM d")}–${format(e, "d, yyyy")}`;
  }
  return `${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")}`;
}

export function formatDiscipline(d: string): string {
  const map: Record<string, string> = {
    show_jumping: "Show Jumping",
    eventing: "Eventing",
    dressage: "Dressage",
    hunters: "Hunters",
    equitation: "Equitation",
    reining: "Reining",
    cutting: "Cutting",
    barrel_racing: "Barrel Racing",
    western_dressage: "Western Dressage",
    western_pleasure: "Western Pleasure",
    endurance: "Endurance",
    combined_driving: "Combined Driving",
    para_equestrian: "Para Equestrian",
    other: "Other",
  };
  return map[d] ?? d;
}

export const DISCIPLINE_OPTIONS = [
  { value: "show_jumping", label: "Show Jumping" },
  { value: "eventing", label: "Eventing" },
  { value: "dressage", label: "Dressage" },
  { value: "hunters", label: "Hunters" },
  { value: "equitation", label: "Equitation" },
];
