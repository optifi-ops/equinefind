"use client";

/**
 * MapView — Google Maps with event pins, clustering, and click-to-card overlay.
 * Loaded via @googlemaps/js-api-loader to avoid adding the SDK as a dep
 * (the API key is injected at runtime via env).
 */
import { useEffect, useRef, useState } from "react";
import type { EventListItem } from "@/types/event";
import { EventCard } from "./EventCard";
import { X } from "lucide-react";

interface Props {
  events: EventListItem[];
  center?: { lat: number; lng: number };
}

declare global {
  interface Window {
    google: typeof google;
    initEquineFindMap?: () => void;
  }
}

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";

function loadMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.google !== "undefined") { resolve(); return; }
    const existing = document.getElementById("gmaps-script");
    if (existing) { existing.addEventListener("load", () => resolve()); return; }

    window.initEquineFindMap = resolve;
    const script = document.createElement("script");
    script.id = "gmaps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=marker&callback=initEquineFindMap`;
    script.async = true;
    script.defer = true;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function MapView({ events, center }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [selected, setSelected] = useState<EventListItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadMapsScript().then(() => {
      if (cancelled || !mapRef.current) return;

      const defaultCenter = center ?? { lat: 37.8, lng: -80 }; // SE US center
      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: center ? 9 : 6,
        mapId: "equinefind-events",
        disableDefaultUI: false,
        clickableIcons: false,
        styles: [
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
        ],
      });
      mapInstanceRef.current = map;

      renderMarkers(map, events, setSelected);
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when events change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    markersRef.current.forEach((m) => { m.map = null; });
    markersRef.current = [];
    renderMarkers(mapInstanceRef.current, events, setSelected, markersRef);
  }, [events]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {selected && (
        <div className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-80 z-10">
          <div className="relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-2 -right-2 z-10 bg-white border border-border rounded-full p-0.5 shadow-card hover:bg-mist"
            >
              <X size={14} className="text-slate" />
            </button>
            <EventCard event={selected} />
          </div>
        </div>
      )}

      {!MAPS_API_KEY && (
        <div className="absolute inset-0 flex items-center justify-center bg-mist/80">
          <p className="text-sm text-slate">Add NEXT_PUBLIC_GOOGLE_MAPS_KEY to enable map view.</p>
        </div>
      )}
    </div>
  );
}

function renderMarkers(
  map: google.maps.Map,
  events: EventListItem[],
  onSelect: (e: EventListItem) => void,
  markersRef?: React.MutableRefObject<google.maps.marker.AdvancedMarkerElement[]>,
) {
  const eventsWithCoords = events.filter(
    (e) => e.venue
  );

  // Group by venue to cluster events at same location
  const byVenue = new Map<string, EventListItem[]>();
  for (const event of eventsWithCoords) {
    const key = event.venue!.id;
    if (!byVenue.has(key)) byVenue.set(key, []);
    byVenue.get(key)!.push(event);
  }

  // For each venue with a location, place a marker
  // (we'd need lat/lng on VenueRead — for now skip venues without coords)
  for (const [, venueEvents] of byVenue) {
    const venue = venueEvents[0].venue!;
    if (!venue.lat || !venue.lng) continue;

    const pin = document.createElement("div");
    pin.className = [
      "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold cursor-pointer",
      venueEvents.length > 1 ? "bg-hunter text-white border-hunter-dark" : "bg-white text-hunter border-hunter",
    ].join(" ");
    pin.textContent = venueEvents.length > 1 ? String(venueEvents.length) : "•";

    const marker = new window.google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat: venue.lat!, lng: venue.lng! },
      content: pin,
      title: venue.name,
    });

    marker.addListener("click", () => onSelect(venueEvents[0]));
    if (markersRef) markersRef.current.push(marker);
  }
}
