import { cn } from "@/lib/utils";
import type { EventType } from "@/types/event";

const styles: Record<string, string> = {
  recognized: "bg-gold-light text-gold border-gold",
  schooling:  "bg-sage-light text-sage border-sage",
  clinic:     "bg-mist text-slate border-border",
  schooling_day: "bg-sage-light text-sage border-sage",
  other:      "bg-mist text-slate border-border",
};

const labels: Record<string, string> = {
  recognized: "Recognized",
  schooling: "Schooling",
  clinic: "Clinic",
  schooling_day: "Schooling Day",
  other: "Other",
};

export function EventTypeBadge({ type }: { type: EventType }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border", styles[type] ?? styles.other)}>
      {labels[type] ?? type}
    </span>
  );
}
