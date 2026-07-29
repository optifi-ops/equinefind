import type { Horse } from "./horse";

export interface ClinicDetails {
  id: string;
  event_id: string;
  clinician_name?: string;
  clinician_bio?: string;
  signup_open_date?: string;
  signup_close_date?: string;
  notes?: string;
  created_at: string;
}

export interface ClinicSlot {
  id: string;
  clinic_detail_id: string;
  name: string;
  description?: string;
  max_capacity?: number;
  price_cents?: number;
  sort_order: number;
  created_at: string;
  signup_count?: number;
  slot_date?: string;
  duration_minutes?: number;
  start_time?: string;
  end_time?: string;
  riders_per_lesson?: number;
}

export type SignupStatus = "confirmed" | "waitlisted" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface ClinicSignupHorse {
  id: string;
  clinic_signup_id: string;
  horse_id?: string;
  ride_time?: string;
  sort_order: number;
  created_at: string;
  horse?: Horse;
}

export interface ClinicSignup {
  id: string;
  clinic_slot_id: string;
  user_id: string;
  horse_id?: string;
  rider_name: string;
  rider_email: string;
  horse_name?: string;
  status: SignupStatus;
  payment_status: PaymentStatus;
  rider_notes?: string;
  organizer_notes?: string;
  ride_time?: string;
  created_at: string;
  slot_name?: string;
  horses?: ClinicSignupHorse[];
}

export interface ClinicWithSlots extends ClinicDetails {
  slots: ClinicSlot[];
}
