export interface User {
  id: string;
  email: string;
  display_name?: string;
  compete_name?: string;
  usef_id?: string;
  location_zip?: string;
  default_radius: number;
  role: "user" | "organizer" | "admin";
  created_at: string;
}

export interface AlertSubscription {
  id: string;
  user_id: string;
  label?: string;
  zip_code?: string;
  radius_miles: number;
  disciplines?: string[];
  event_types?: string[];
  date_from?: string;
  date_to?: string;
  frequency: "immediate" | "daily" | "weekly";
  is_active: boolean;
  created_at: string;
}
