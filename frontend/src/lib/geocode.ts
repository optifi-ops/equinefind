import { supabase } from "./auth";

interface GeoResult {
  lat: number;
  lng: number;
}

export async function geocodeZip(zip: string): Promise<GeoResult | null> {
  if (!/^\d{5}$/.test(zip)) return null;

  const { data: cached } = await supabase
    .from("zip_geocode_cache")
    .select("lat, lng")
    .eq("zip_code", zip)
    .single();

  if (cached) return { lat: cached.lat, lng: cached.lng };

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=US&format=json&limit=1`,
      { headers: { "User-Agent": "EquineFind/1.0" } }
    );
    const results = await res.json();
    if (!results.length) return null;

    const lat = parseFloat(results[0].lat);
    const lng = parseFloat(results[0].lon);

    await supabase.from("zip_geocode_cache").upsert({ zip_code: zip, lat, lng });

    return { lat, lng };
  } catch {
    return null;
  }
}
