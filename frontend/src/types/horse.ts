export interface Horse {
  id: string;
  user_id: string;
  name: string; // barn / call name — the everyday identifier
  registered_name?: string;
  birth_year?: number; // age is computed from this via horseAge()
  gender?: string; // Mare | Gelding | Stallion
  breed?: string;
  usef_number?: string;
  usea_number?: string;
  usdf_number?: string;
  disciplines: string[];
  created_at: string;
}
