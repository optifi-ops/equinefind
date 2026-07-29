export interface Venue {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  country: string;
  website?: string;
  lat?: number;
  lng?: number;
}
