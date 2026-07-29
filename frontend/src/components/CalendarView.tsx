"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  parseISO,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { EventListItem } from "@/types/event";
import { formatDiscipline } from "@/lib/utils";

interface Props {
  events: EventListItem[];
}

const typeColor: Record<string, string> = {
  recognized: "bg-gold/20 text-gold border-gold/30",
  schooling: "bg-sage/20 text-hunter border-sage/30",
  clinic: "bg-slate/10 text-slate border-slate/20",
};

export function CalendarView({ events }: Props) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventListItem[]>();
    for (const event of events) {
      const start = parseISO(event.start_date);
      const end = parseISO(event.end_date);
      for (const day of days) {
        if (day >= start && day <= end) {
          const key = format(day, "yyyy-MM-dd");
          if (!map.has(key)) map.set(key, []);
          map.get(key)!.push(event);
        }
      }
    }
    return map;
  }, [events, days]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          className="p-2 border border-border rounded hover:border-hunter transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <h2 className="font-display text-2xl text-charcoal">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="p-2 border border-border rounded hover:border-hunter transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 border border-border rounded overflow-hidden">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-xs font-semibold text-slate uppercase tracking-wider text-center bg-mist border-b border-border"
          >
            {d}
          </div>
        ))}

        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate.get(key) ?? [];
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);

          return (
            <div
              key={key}
              className={[
                "min-h-[100px] border-b border-r border-border p-1",
                inMonth ? "bg-white" : "bg-mist/50",
              ].join(" ")}
            >
              <div
                className={[
                  "text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                  today ? "bg-hunter text-white" : inMonth ? "text-charcoal" : "text-slate/40",
                ].join(" ")}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((event) => (
                  <Link
                    key={`${event.id}-${key}`}
                    href={`/events/${event.slug}`}
                    className={[
                      "block px-1.5 py-0.5 text-[10px] leading-tight rounded border truncate",
                      "hover:opacity-80 transition-opacity",
                      typeColor[event.event_type] ?? "bg-mist text-charcoal border-border",
                    ].join(" ")}
                    title={`${event.title} — ${event.disciplines.map(formatDiscipline).join(", ")}`}
                  >
                    {event.title}
                  </Link>
                ))}
                {dayEvents.length > 3 && (
                  <span className="block px-1.5 text-[10px] text-slate">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
