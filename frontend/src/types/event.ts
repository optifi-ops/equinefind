import type { Venue } from "./venue";

export type EventType = "recognized" | "schooling" | "clinic" | "schooling_day" | "other";
export type EventStatus = "upcoming" | "cancelled" | "postponed" | "completed";

export interface EventListItem {
  id: string;
  slug: string;
  title: string;
  event_type: EventType;
  status: EventStatus;
  start_date: string;
  end_date: string;
  disciplines: string[];
  levels_offered?: string[];
  requires_usef: boolean;
  requires_usea: boolean;
  requires_usdf: boolean;
  is_featured: boolean;
  cost_notes?: string;
  venue?: Venue;
  distance_miles?: number;
}

export interface Event extends EventListItem {
  description?: string;
  entry_open_date?: string;
  entry_close_date?: string;
  registration_url?: string;
  entry_fee_notes?: string;
  organizer_name?: string;
  organizer_email?: string;
  organizer_phone?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedEvents {
  items: EventListItem[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface EventFilters {
  zip?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  date_from?: string;
  date_to?: string;
  disciplines?: string[];
  event_type?: string[];
  requires_usef?: boolean;
  requires_usdf?: boolean;
  requires_usea?: boolean;
  q?: string;
  sort?: "date_asc" | "date_desc" | "distance";
  page?: number;
  per_page?: number;
}
