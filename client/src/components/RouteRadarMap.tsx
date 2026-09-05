/**
 * RouteRadarMap
 * ---------------------------------------------------------------------
 * Frontend-only, fully simulated interactive map for the Route Radar step.
 * Built with Leaflet + react-leaflet and OpenStreetMap tiles — no Google
 * Maps API, no backend calls, no real routing service. Marker positions
 * are derived client-side from a small city lookup table plus fixed
 * offsets, purely for a believable visual demo.
 */

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Fix Leaflet's default marker asset paths, which break under bundlers
// like Vite because the default icon URLs resolve relative to the page,
// not the package. We don't rely on the default icon (every marker below
// uses a custom divIcon), but this keeps any incidental Leaflet-internal
// marker usage (e.g. popup anchors) from rendering broken image icons.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export type LatLng = { lat: number; lng: number };

export const cityCoordinates: Record<string, LatLng> = {
  jaipur: { lat: 26.9124, lng: 75.7873 },
  udaipur: { lat: 24.5854, lng: 73.7125 },
  goa: { lat: 15.2993, lng: 74.124 },
  manali: { lat: 32.2432, lng: 77.1892 },
  delhi: { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  kerala: { lat: 10.8505, lng: 76.2711 },
  pushkar: { lat: 26.4907, lng: 74.551 },
  jodhpur: { lat: 26.2389, lng: 73.0243 },
  amritsar: { lat: 31.634, lng: 74.8723 },
};

/** Resolve a free-text destination to known coordinates, defaulting to Jaipur. */
export function resolveDestinationCoordinates(destination: string): LatLng {
  const key = destination.trim().toLowerCase();
  if (cityCoordinates[key]) return cityCoordinates[key];
  const match = Object.keys(cityCoordinates).find((city) => key.includes(city));
  return match ? cityCoordinates[match] : cityCoordinates.jaipur;
}

function withOffset(base: LatLng, dLat: number, dLng: number): LatLng {
  return { lat: base.lat + dLat, lng: base.lng + dLng };
}

type MarkerTone = "teal" | "saffron";

function createPinIcon(tone: MarkerTone, glyph: string) {
  const color = tone === "saffron" ? "#D97706" : "#0D9488";
  const html = `
    <div style="position:relative;width:34px;height:42px;">
      <svg width="34" height="42" viewBox="0 0 34 42" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 0C7.6 0 0 7.5 0 16.8 0 28.6 17 42 17 42s17-13.4 17-25.2C34 7.5 26.4 0 17 0z" fill="${color}"/>
        <circle cx="17" cy="16.5" r="9.5" fill="#F5F1E8"/>
        <text x="17" y="20.5" text-anchor="middle" font-size="11" font-weight="700" fill="${color}" font-family="Manrope, sans-serif">${glyph}</text>
      </svg>
    </div>`;
  return L.divIcon({
    className: "route-radar-pin",
    html,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    popupAnchor: [0, -36],
  });
}

type WaypointKind = "start" | "local" | "scenic" | "hotel" | "extra";

type RouteRadarMarker = {
  id: WaypointKind;
  label: string;
  position: LatLng;
  tone: MarkerTone;
  glyph: string;
};

function RecenterOnDestinationChange({ center }: { center: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

export function RouteRadarMap({
  destination,
  originLabel,
  localStopLabel,
  scenicStopLabel,
  hotelLabel,
  onLocalStopClick,
}: {
  destination: string;
  originLabel: string;
  localStopLabel: string;
  scenicStopLabel: string;
  hotelLabel: string;
  onLocalStopClick: () => void;
}) {
  const center = useMemo(() => resolveDestinationCoordinates(destination), [destination]);

  const markers = useMemo<RouteRadarMarker[]>(
    () => [
      { id: "start", label: originLabel || "Start", position: center, tone: "teal", glyph: "S" },
      { id: "local", label: "Sharma Ji Samosa Hub", position: withOffset(center, 0.021, 0.017), tone: "saffron", glyph: "L" },
      { id: "scenic", label: scenicStopLabel || "Viewpoint", position: withOffset(center, 0.038, -0.012), tone: "teal", glyph: "V" },
      { id: "hotel", label: hotelLabel || "Heritage Hotel", position: withOffset(center, 0.05, 0.031), tone: "teal", glyph: "H" },
      { id: "extra", label: "Local Market", position: withOffset(center, -0.017, 0.026), tone: "teal", glyph: "M" },
    ],
    [center, originLabel, scenicStopLabel, hotelLabel],
  );

  const path = useMemo<[number, number][]>(
    () => [markers[0], markers[4], markers[1], markers[2], markers[3]].map((m) => [m.position.lat, m.position.lng]),
    [markers],
  );

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Polyline positions={path} pathOptions={{ color: "#0D9488", weight: 4, opacity: 0.7 }} />
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.position.lat, marker.position.lng]}
          icon={createPinIcon(marker.tone, marker.glyph)}
          eventHandlers={marker.id === "local" ? { click: onLocalStopClick } : undefined}
        >
          <Popup>{marker.label}</Popup>
        </Marker>
      ))}
      <RecenterOnDestinationChange center={center} />
    </MapContainer>
  );
}
