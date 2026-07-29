import { useQuery } from "@tanstack/react-query";
import { venuesApi } from "@/lib/api";

export function useVenue(idOrSlug: string) {
  return useQuery({
    queryKey: ["venue", idOrSlug],
    queryFn: () => venuesApi.get(idOrSlug),
    enabled: !!idOrSlug,
  });
}
