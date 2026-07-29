export interface Horse {
  id: string;
  user_id: string;
  name: string;
  breed?: string;
  usef_number?: string;
  usea_number?: string;
  usdf_number?: string;
  level?: string;
  disciplines: string[];
  created_at: string;
}
