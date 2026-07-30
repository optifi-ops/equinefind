export interface TimeBlock {
  time: string;
  value: string;
  available: boolean;
  bookedCount: number;
}

/**
 * Master switch for the rider-facing time-block signup feature (organizer
 * defines a time grid, riders self-select a slot during signup). Turned off
 * after beta — organizers prefer to assign ride times themselves once
 * registration closes (see the Scheduling tab). The code is kept intact so the
 * feature can be re-enabled by flipping this to `true`.
 */
export const ENABLE_TIME_BLOCK_SIGNUP = false;

/**
 * Add `minutes` to an "HH:MM" or "HH:MM:SS" time, returning "HH:MM:SS".
 * Used by the Scheduling tab to cascade ride times off a slot's start time.
 */
export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const wrapped = ((total % 1440) + 1440) % 1440;
  const hh = Math.floor(wrapped / 60).toString().padStart(2, "0");
  const mm = (wrapped % 60).toString().padStart(2, "0");
  return `${hh}:${mm}:00`;
}

/** Normalize a time value to the "HH:MM" form an <input type="time"> expects. */
export function toTimeInputValue(value: string | null | undefined): string {
  if (!value) return "";
  const [h, m] = value.split(":");
  if (h === undefined || m === undefined) return "";
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

export function generateTimeBlocks(
  startTime: string,
  endTime: string,
  durationMinutes: number
): Omit<TimeBlock, "available" | "bookedCount">[] {
  const blocks: Omit<TimeBlock, "available" | "bookedCount">[] = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;

  for (let t = startTotal; t + durationMinutes <= endTotal; t += durationMinutes) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    const hh = h.toString().padStart(2, "0");
    const mm = m.toString().padStart(2, "0");
    blocks.push({
      time: formatTime12(h, m),
      value: `${hh}:${mm}:00`,
    });
  }

  return blocks;
}

export function markAvailability(
  blocks: Omit<TimeBlock, "available" | "bookedCount">[],
  bookedTimes: string[],
  ridersPerLesson: number
): TimeBlock[] {
  const countMap = new Map<string, number>();
  for (const t of bookedTimes) {
    const normalized = normalizeTime(t);
    countMap.set(normalized, (countMap.get(normalized) ?? 0) + 1);
  }

  return blocks.map((b) => {
    const count = countMap.get(b.value) ?? 0;
    return {
      ...b,
      bookedCount: count,
      available: count < ridersPerLesson,
    };
  });
}

function normalizeTime(t: string): string {
  const parts = t.split(":");
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:00`;
  }
  return t;
}

function formatTime12(h: number, m: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const mm = m.toString().padStart(2, "0");
  return `${h12}:${mm} ${period}`;
}

export function formatTimeValue(value: string): string {
  const [hStr, mStr] = value.split(":");
  return formatTime12(parseInt(hStr), parseInt(mStr));
}
