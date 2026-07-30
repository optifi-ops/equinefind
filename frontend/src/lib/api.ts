import { supabase } from "./auth";
import type { Event, EventListItem, EventFilters, PaginatedEvents } from "@/types/event";
import type { Venue } from "@/types/venue";
import type { Horse } from "@/types/horse";
import type { ClinicDetails, ClinicSlot, ClinicSignup, ClinicWithSlots } from "@/types/clinic";

export interface SavedEventWithMeta extends EventListItem {
  saved_event_id: string;
  horse_ids: string[];
}

export const eventsApi = {
  list: async (filters: EventFilters): Promise<PaginatedEvents> => {
    const { data, error } = await supabase.rpc("search_events", {
      p_lat: filters.lat ?? null,
      p_lng: filters.lng ?? null,
      p_radius_miles: filters.radius ?? 100,
      p_date_from: filters.date_from ?? null,
      p_date_to: filters.date_to ?? null,
      p_disciplines: filters.disciplines?.length ? filters.disciplines : null,
      p_event_type: filters.event_type?.length ? filters.event_type : null,
      p_requires_usef: filters.requires_usef ?? null,
      p_requires_usea: filters.requires_usea ?? null,
      p_requires_usdf: filters.requires_usdf ?? null,
      p_q: filters.q || null,
      p_sort: filters.sort ?? "date_asc",
      p_page: filters.page ?? 1,
      p_per_page: filters.per_page ?? 20,
    });
    if (error) throw new Error(error.message);
    return data as PaginatedEvents;
  },

  get: async (slug: string): Promise<Event> => {
    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        venue:venues (id, name, slug, city, state, country, website, location)
      `)
      .eq("slug", slug)
      .single();
    if (error) throw new Error(error.message);
    return data as Event;
  },

  create: async (event: Partial<Event>): Promise<Event> => {
    const { data, error } = await supabase
      .from("events")
      .insert({ ...event, slug: "" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Event;
  },

  update: async (id: string, updates: Partial<Event>): Promise<Event> => {
    const { data, error } = await supabase
      .from("events")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Event;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};

export const savedEventsApi = {
  list: async (userId: string): Promise<SavedEventWithMeta[]> => {
    const { data, error } = await supabase
      .from("saved_events")
      .select(`
        id,
        event_id,
        events:event_id (
          id, slug, title, event_type, status, start_date, end_date,
          disciplines, levels_offered,
          requires_usef, requires_usea, requires_usdf,
          is_featured, cost_notes,
          venue:venues (id, name, slug, city, state, country, website, location)
        ),
        saved_event_horses (horse_id)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((row: any) => ({
      ...(row.events as EventListItem),
      saved_event_id: row.id,
      horse_ids: (row.saved_event_horses ?? []).map((h: { horse_id: string }) => h.horse_id),
    }));
  },

  isSaved: async (userId: string, eventId: string): Promise<{ saved: boolean; savedEventId?: string }> => {
    const { data, error } = await supabase
      .from("saved_events")
      .select("id")
      .eq("user_id", userId)
      .eq("event_id", eventId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? { saved: true, savedEventId: data.id } : { saved: false };
  },

  save: async (userId: string, eventId: string): Promise<string> => {
    const { data, error } = await supabase
      .from("saved_events")
      .upsert({ user_id: userId, event_id: eventId }, { onConflict: "user_id,event_id" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return data.id;
  },

  unsave: async (userId: string, eventId: string): Promise<void> => {
    const { error } = await supabase
      .from("saved_events")
      .delete()
      .eq("user_id", userId)
      .eq("event_id", eventId);
    if (error) throw new Error(error.message);
  },
};

export const horsesApi = {
  list: async (userId: string): Promise<Horse[]> => {
    const { data, error } = await supabase
      .from("horses")
      .select("*")
      .eq("user_id", userId)
      .order("name");
    if (error) throw new Error(error.message);
    return data as Horse[];
  },

  create: async (horse: Omit<Horse, "id" | "created_at">): Promise<Horse> => {
    const { data, error } = await supabase
      .from("horses")
      .insert(horse)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Horse;
  },

  update: async (id: string, updates: Partial<Horse>): Promise<Horse> => {
    const { data, error } = await supabase
      .from("horses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Horse;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("horses").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};

export const savedEventHorsesApi = {
  listForEvent: async (savedEventId: string): Promise<string[]> => {
    const { data, error } = await supabase
      .from("saved_event_horses")
      .select("horse_id")
      .eq("saved_event_id", savedEventId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.horse_id);
  },

  setForEvent: async (savedEventId: string, horseIds: string[]): Promise<void> => {
    const { error: deleteError } = await supabase
      .from("saved_event_horses")
      .delete()
      .eq("saved_event_id", savedEventId);
    if (deleteError) throw new Error(deleteError.message);

    if (horseIds.length > 0) {
      const { error: insertError } = await supabase
        .from("saved_event_horses")
        .insert(horseIds.map((horse_id) => ({ saved_event_id: savedEventId, horse_id })));
      if (insertError) throw new Error(insertError.message);
    }
  },
};

export const clinicApi = {
  getDetails: async (eventId: string): Promise<ClinicWithSlots | null> => {
    const { data, error } = await supabase
      .from("clinic_details")
      .select("*, clinic_slots(*)")
      .eq("event_id", eventId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const details = data as any;
    const slots = (details.clinic_slots ?? []) as ClinicSlot[];
    slots.sort((a, b) => a.sort_order - b.sort_order);
    return { ...details, clinic_slots: undefined, slots } as ClinicWithSlots;
  },

  getSlotSignupCounts: async (clinicDetailId: string): Promise<Record<string, number>> => {
    const { data, error } = await supabase
      .from("clinic_signups")
      .select("clinic_slot_id")
      .in(
        "clinic_slot_id",
        (await supabase.from("clinic_slots").select("id").eq("clinic_detail_id", clinicDetailId)).data?.map((s) => s.id) ?? []
      )
      .in("status", ["confirmed", "waitlisted"]);
    if (error) throw new Error(error.message);
    const counts: Record<string, number> = {};
    (data ?? []).forEach((row) => {
      counts[row.clinic_slot_id] = (counts[row.clinic_slot_id] ?? 0) + 1;
    });
    return counts;
  },

  getSlotBookedTimes: async (clinicDetailId: string): Promise<Record<string, string[]>> => {
    const { data: slots } = await supabase
      .from("clinic_slots")
      .select("id")
      .eq("clinic_detail_id", clinicDetailId);
    if (!slots?.length) return {};

    const { data, error } = await supabase
      .from("clinic_signups")
      .select("clinic_slot_id, clinic_signup_horses(ride_time)")
      .in("clinic_slot_id", slots.map((s) => s.id))
      .in("status", ["confirmed", "waitlisted"]);
    if (error) throw new Error(error.message);

    const result: Record<string, string[]> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data ?? []).forEach((row: any) => {
      const times = (row.clinic_signup_horses ?? [])
        .map((h: { ride_time: string | null }) => h.ride_time)
        .filter(Boolean) as string[];
      result[row.clinic_slot_id] = [
        ...(result[row.clinic_slot_id] ?? []),
        ...times,
      ];
    });
    return result;
  },

  createClinic: async (
    eventData: Partial<Event> & { organizer_user_id: string },
    clinicDetails: Omit<ClinicDetails, "id" | "event_id" | "created_at">,
    slots: Omit<ClinicSlot, "id" | "clinic_detail_id" | "created_at" | "signup_count">[]
  ): Promise<{ event: Event; clinicDetails: ClinicDetails }> => {
    const event = await eventsApi.create({ ...eventData, event_type: "clinic" });

    const { data: cd, error: cdErr } = await supabase
      .from("clinic_details")
      .insert({ ...clinicDetails, event_id: event.id })
      .select()
      .single();
    if (cdErr) throw new Error(cdErr.message);

    if (slots.length > 0) {
      const { error: slotErr } = await supabase
        .from("clinic_slots")
        .insert(slots.map((s, i) => {
          const { id: _id, ...rest } = s as Record<string, unknown>;
          return { ...rest, clinic_detail_id: cd.id, sort_order: i };
        }));
      if (slotErr) throw new Error(slotErr.message);
    }

    return { event, clinicDetails: cd as ClinicDetails };
  },

  updateClinic: async (
    eventId: string,
    eventUpdates: Partial<Event>,
    clinicUpdates: Partial<Omit<ClinicDetails, "id" | "event_id" | "created_at">>,
    slots?: { id?: string; name: string; description?: string; slot_date?: string; max_capacity?: number; price_cents?: number; sort_order: number; duration_minutes?: number; start_time?: string; end_time?: string; riders_per_lesson?: number }[]
  ): Promise<void> => {
    await eventsApi.update(eventId, eventUpdates);

    const { error: cdErr } = await supabase
      .from("clinic_details")
      .update(clinicUpdates)
      .eq("event_id", eventId);
    if (cdErr) throw new Error(cdErr.message);

    if (slots) {
      const { data: cd } = await supabase
        .from("clinic_details")
        .select("id")
        .eq("event_id", eventId)
        .single();
      if (!cd) throw new Error("Clinic details not found");

      const existingIds = slots.filter((s) => s.id).map((s) => s.id!);
      if (existingIds.length > 0) {
        const { error: delErr } = await supabase
          .from("clinic_slots")
          .delete()
          .eq("clinic_detail_id", cd.id)
          .not("id", "in", `(${existingIds.join(",")})`);
        if (delErr) throw new Error(`Delete failed: ${delErr.message}`);
      } else {
        const { error: delErr } = await supabase
          .from("clinic_slots")
          .delete()
          .eq("clinic_detail_id", cd.id);
        if (delErr) throw new Error(`Delete failed: ${delErr.message}`);
      }

      for (const slot of slots) {
        if (slot.id) {
          const { error: updErr, data: updData } = await supabase.from("clinic_slots").update({
            name: slot.name,
            description: slot.description ?? null,
            slot_date: slot.slot_date ?? null,
            max_capacity: slot.max_capacity ?? null,
            price_cents: slot.price_cents ?? null,
            sort_order: slot.sort_order,
            duration_minutes: slot.duration_minutes ?? null,
            start_time: slot.start_time ?? null,
            end_time: slot.end_time ?? null,
            riders_per_lesson: slot.riders_per_lesson ?? 1,
          }).eq("id", slot.id).select();
          if (updErr) throw new Error(updErr.message);
          if (!updData || updData.length === 0) {
            throw new Error(`Slot update returned no rows for id ${slot.id} — likely blocked by RLS. Are you signed in as the clinic organizer?`);
          }
        } else {
          const { error: insErr } = await supabase.from("clinic_slots").insert({
            ...slot,
            clinic_detail_id: cd.id,
          });
          if (insErr) throw new Error(insErr.message);
        }
      }
    }
  },

  listOrganizerClinics: async (userId: string): Promise<(Event & { clinic_details: ClinicDetails })[]> => {
    const { data, error } = await supabase
      .from("events")
      .select("*, clinic_details(*), venue:venues(id, name, slug, city, state, country, website)")
      .eq("organizer_user_id", userId)
      .eq("event_type", "clinic")
      .order("start_date", { ascending: false });
    if (error) throw new Error(error.message);
    return data as (Event & { clinic_details: ClinicDetails })[];
  },
};

export const clinicSignupApi = {
  listForClinic: async (clinicDetailId: string): Promise<(ClinicSignup & { slot_name: string })[]> => {
    const { data: slots } = await supabase
      .from("clinic_slots")
      .select("id, name")
      .eq("clinic_detail_id", clinicDetailId);
    if (!slots?.length) return [];

    const slotMap = new Map(slots.map((s) => [s.id, s.name]));
    const { data, error } = await supabase
      .from("clinic_signups")
      .select("*, clinic_signup_horses(id, clinic_signup_id, horse_id, ride_time, sort_order, created_at)")
      .in("clinic_slot_id", slots.map((s) => s.id))
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);

    // Horse profiles are private — organizers may only see barn name / age / gender,
    // served through the security-definer `clinic_signup_horse_public` view.
    const signupIds = (data ?? []).map((s) => s.id);
    const safeByHorseRow = new Map<string, { id: string; name: string; birth_year?: number; gender?: string }>();
    if (signupIds.length > 0) {
      const { data: safeRows, error: safeErr } = await supabase
        .from("clinic_signup_horse_public")
        .select("signup_horse_id, horse_id, barn_name, birth_year, gender")
        .in("clinic_signup_id", signupIds);
      if (safeErr) throw new Error(safeErr.message);
      for (const r of safeRows ?? []) {
        safeByHorseRow.set(r.signup_horse_id, {
          id: r.horse_id,
          name: r.barn_name,
          birth_year: r.birth_year ?? undefined,
          gender: r.gender ?? undefined,
        });
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((s: any) => ({
      ...s,
      slot_name: slotMap.get(s.clinic_slot_id) ?? "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      horses: (s.clinic_signup_horses ?? []).map((h: any) => ({
        ...h,
        horse: safeByHorseRow.get(h.id) ?? undefined,
      })),
      clinic_signup_horses: undefined,
    })) as (ClinicSignup & { slot_name: string })[];
  },

  listForUser: async (userId: string): Promise<(ClinicSignup & { slot_name: string; event_title: string; event_slug: string; start_date: string })[]> => {
    const { data, error } = await supabase
      .from("clinic_signups")
      .select(`
        *,
        clinic_slot:clinic_slot_id (
          name,
          clinic_detail:clinic_detail_id (
            event:event_id (title, slug, start_date)
          )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((row: any) => ({
      ...row,
      slot_name: row.clinic_slot?.name ?? "",
      event_title: row.clinic_slot?.clinic_detail?.event?.title ?? "",
      event_slug: row.clinic_slot?.clinic_detail?.event?.slug ?? "",
      start_date: row.clinic_slot?.clinic_detail?.event?.start_date ?? "",
      clinic_slot: undefined,
    }));
  },

  signup: async (data: {
    clinic_slot_id: string;
    user_id: string;
    horse_id?: string;
    rider_name: string;
    rider_email: string;
    horse_name?: string;
    rider_notes?: string;
    status?: "confirmed" | "waitlisted";
  }): Promise<ClinicSignup> => {
    const { data: signup, error } = await supabase
      .from("clinic_signups")
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return signup as ClinicSignup;
  },

  signupWithHorses: async (data: {
    clinic_slot_id: string;
    user_id: string;
    rider_name: string;
    rider_email: string;
    rider_notes?: string;
    status?: "confirmed" | "waitlisted";
    horses: {
      horse_id: string;
      horse_name: string;
      ride_time?: string;
    }[];
  }): Promise<ClinicSignup> => {
    const firstHorse = data.horses[0];
    const { data: signup, error } = await supabase
      .from("clinic_signups")
      .insert({
        clinic_slot_id: data.clinic_slot_id,
        user_id: data.user_id,
        rider_name: data.rider_name,
        rider_email: data.rider_email,
        rider_notes: data.rider_notes,
        status: data.status ?? "confirmed",
        horse_id: firstHorse?.horse_id,
        horse_name: firstHorse?.horse_name,
        ride_time: firstHorse?.ride_time,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (data.horses.length > 0) {
      const { error: hErr } = await supabase
        .from("clinic_signup_horses")
        .insert(data.horses.map((h, i) => ({
          clinic_signup_id: signup.id,
          horse_id: h.horse_id,
          ride_time: h.ride_time ?? null,
          sort_order: i,
        })));
      if (hErr) throw new Error(hErr.message);
    }

    return signup as ClinicSignup;
  },

  cancel: async (signupId: string): Promise<void> => {
    const { error } = await supabase
      .from("clinic_signups")
      .update({ status: "cancelled" })
      .eq("id", signupId);
    if (error) throw new Error(error.message);
  },

  updateSignup: async (signupId: string, updates: Partial<Pick<ClinicSignup, "status" | "payment_status" | "ride_time" | "organizer_notes">>): Promise<void> => {
    const { error } = await supabase
      .from("clinic_signups")
      .update(updates)
      .eq("id", signupId);
    if (error) throw new Error(error.message);
  },

  // Persist the running order + assigned ride time for each horse in a slot.
  // Each row is one clinic_signup_horses record (one rider+horse lesson).
  saveSchedule: async (
    rows: { id: string; ride_time: string | null; sort_order: number }[]
  ): Promise<void> => {
    for (const row of rows) {
      const { error, data } = await supabase
        .from("clinic_signup_horses")
        .update({ ride_time: row.ride_time, sort_order: row.sort_order })
        .eq("id", row.id)
        .select("id");
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) {
        throw new Error("Schedule update was blocked — make sure you are the clinic organizer.");
      }
    }
  },
};

export const venuesApi = {
  list: async (params?: { q?: string; state?: string }): Promise<Venue[]> => {
    let query = supabase.from("venues").select("id, name, slug, city, state, country, website").order("name");
    if (params?.q) query = query.ilike("name", `%${params.q}%`);
    if (params?.state) query = query.eq("state", params.state);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data as Venue[];
  },

  get: async (slug: string): Promise<Venue> => {
    const { data, error } = await supabase
      .from("venues")
      .select("id, name, slug, city, state, country, website")
      .eq("slug", slug)
      .single();
    if (error) throw new Error(error.message);
    return data as Venue;
  },
};
