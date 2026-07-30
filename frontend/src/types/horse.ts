export interface Horse {
  id: string;
  user_id: string;
  name: string; // barn / call name — the everyday identifier
  registered_name?: string;
  age?: number;
  gender?: string; // Mare | Gelding | Stallion
  breed?: string;
  usef_number?: string;
  usea_number?: string;
  usdf_number?: string;
  disciplines: string[];
  created_at: string;
}
