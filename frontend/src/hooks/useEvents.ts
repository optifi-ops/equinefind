import { useQuery } from "@tanstack/react-query";
import { eventsApi } from "@/lib/api";
import { geocodeZip } from "@/lib/geocode";
import type { EventFilters } from "@/types/event";

async function fetchWithGeocode(filters: EventFilters) {
  let { lat, lng } = filters;

  if (filters.zip && !lat && !lng) {
    const geo = await geocodeZip(filters.zip);
    if (geo) {
      lat = geo.lat;
      lng = geo.lng;
    }
  }

  return eventsApi.list({ ...filters, lat, lng });
}

export function useEvents(filters: EventFilters) {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: () => fetchWithGeocode(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useEvent(idOrSlug: string) {
  return useQuery({
    queryKey: ["event", idOrSlug],
    queryFn: () => eventsApi.get(idOrSlug),
    enabled: !!idOrSlug,
  });
}
