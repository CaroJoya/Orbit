/**
 * RouteRadarMap
 * ---------------------------------------------------------------------
 * Enhanced map component with:
 * - Main route from start to destination (Google Maps style)
 * - POI (Points of Interest) markers along the route
 * - Clickable POIs that trigger AI chat
 * - Dynamic route updates when POIs are added
 */

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icons
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

export type POIType = 'temple' | 'food' | 'entertainment' | 'shopping';

export interface POI {
  id: string;
  name: string;
  type: POIType;
  position: LatLng;
  description: string;
  detourTime: string;
  detourCost: number;
  rating: string;
  icon: string;
  hours?: string;
}

// Generate POIs near the route with realistic names (no personal names)
export function generatePOIsForRoute(center: LatLng): POI[] {
  const poiData: Array<{
    lat: number;
    lng: number;
    type: POIType;
    name: string;
    desc: string;
    hours: string;
  }> = [
    { 
      lat: 0.008, lng: 0.012, 
      type: 'temple', 
      name: 'Iskcon Temple', 
      desc: 'Spiritual center with peaceful atmosphere and meditation halls.',
      hours: '6:00 AM - 8:00 PM'
    },
    { 
      lat: -0.015, lng: 0.023, 
      type: 'food', 
      name: 'Chai Point', 
      desc: 'Popular tea cafe serving fresh snacks and beverages.',
      hours: '7:00 AM - 10:00 PM'
    },
    { 
      lat: 0.025, lng: -0.008, 
      type: 'entertainment', 
      name: 'PVR Cinemas', 
      desc: 'Multiplex cinema with latest movie releases and premium seating.',
      hours: '9:00 AM - 12:00 AM'
    },
    { 
      lat: -0.012, lng: -0.018, 
      type: 'shopping', 
      name: 'Fabindia', 
      desc: 'Handicrafts, ethnic wear, and home decor from local artisans.',
      hours: '10:00 AM - 9:00 PM'
    },
    { 
      lat: 0.032, lng: 0.015, 
      type: 'food', 
      name: 'Haldiram\'s', 
      desc: 'Famous sweets, snacks, and vegetarian meals with decades of tradition.',
      hours: '8:00 AM - 11:00 PM'
    },
    { 
      lat: -0.028, lng: 0.005, 
      type: 'temple', 
      name: 'Gurudwara', 
      desc: 'Sikh place of worship with community kitchen serving free meals.',
      hours: 'Open 24 hours'
    },
    { 
      lat: 0.018, lng: -0.025, 
      type: 'entertainment', 
      name: 'Fun Zone', 
      desc: 'Arcade games, virtual reality, and activities for all ages.',
      hours: '11:00 AM - 9:00 PM'
    },
    { 
      lat: -0.005, lng: 0.032, 
      type: 'shopping', 
      name: 'Shopper\'s Stop', 
      desc: 'Department store with fashion, accessories, and home goods.',
      hours: '10:00 AM - 10:00 PM'
    },
    { 
      lat: 0.045, lng: -0.015, 
      type: 'food', 
      name: 'Cafe Coffee Day', 
      desc: 'Coffee shop chain with relaxed ambiance and quick bites.',
      hours: '8:00 AM - 11:00 PM'
    },
    { 
      lat: -0.035, lng: 0.018, 
      type: 'temple', 
      name: 'Siddhivinayak Temple', 
      desc: 'Historic temple dedicated to Lord Ganesha with beautiful architecture.',
      hours: '5:30 AM - 10:00 PM'
    },
  ];

  const poiTypes: Record<POIType, { icon: string; cost: number; time: string }> = {
    temple: { icon: '🛕', cost: 0, time: '20-30 min' },
    food: { icon: '🍽️', cost: 300, time: '25-35 min' },
    entertainment: { icon: '🎮', cost: 500, time: '40-60 min' },
    shopping: { icon: '🛍️', cost: 200, time: '30-45 min' },
  };

  return poiData.map((data, index) => {
    const typeInfo = poiTypes[data.type];
    return {
      id: `poi-${index}`,
      name: data.name,
      type: data.type,
      position: { lat: center.lat + data.lat, lng: center.lng + data.lng },
      description: data.desc,
      detourTime: typeInfo.time,
      detourCost: typeInfo.cost,
      rating: (4.0 + Math.random() * 0.9).toFixed(1),
      icon: typeInfo.icon,
      hours: data.hours,
    };
  });
}

export function resolveDestinationCoordinates(destination: string): LatLng {
  const key = destination.trim().toLowerCase();
  if (cityCoordinates[key]) return cityCoordinates[key];
  const match = Object.keys(cityCoordinates).find((city) => key.includes(city));
  return match ? cityCoordinates[match] : cityCoordinates.jaipur;
}

function withOffset(base: LatLng, dLat: number, dLng: number): LatLng {
  return { lat: base.lat + dLat, lng: base.lng + dLng };
}

// Create custom POI marker icon
function createPOIIcon(icon: string, isSelected: boolean = false, isAdded: boolean = false) {
  const size = isSelected ? 48 : isAdded ? 40 : 38;
  let bgColor = '#FFFFFF';
  let borderColor = '#0D9488';
  let shadow = '0 3px 12px rgba(0,0,0,0.15)';
  
  if (isAdded) {
    bgColor = '#0D9488';
    borderColor = '#0D9488';
    shadow = '0 0 0 4px rgba(13,148,136,0.25)';
  } else if (isSelected) {
    bgColor = '#0D9488';
    borderColor = '#0D9488';
    shadow = '0 0 0 6px rgba(13,148,136,0.2)';
  }
  
  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${bgColor};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${isSelected ? '22px' : '18px'};
      box-shadow: ${shadow};
      border: 2px solid ${borderColor};
      transition: all 0.2s ease;
      cursor: pointer;
      transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
      position: relative;
      z-index: ${isSelected ? 1000 : 100};
    ">
      ${icon}
    </div>
  `;
  
  return L.divIcon({
    className: 'poi-marker',
    html,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
}

// Create start/destination marker
function createRouteMarker(type: 'start' | 'destination', label: string) {
  const color = type === 'start' ? '#0D9488' : '#D97706';
  const html = `
    <div style="
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 4px;
      background: ${color};
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 13px;
      transform: rotate(-45deg);
      box-shadow: 0 4px 14px rgba(0,0,0,0.2);
      border: 2px solid white;
    ">
      <span style="transform: rotate(45deg)">${label}</span>
    </div>
  `;
  return L.divIcon({
    className: 'route-marker',
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function RecenterOnDestinationChange({ center }: { center: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

interface RouteRadarMapProps {
  destination: string;
  originLabel: string;
  onPOIClick?: (poi: POI) => void;
  selectedPOI?: POI | null;
  addedPOIs?: POI[];
}

export function RouteRadarMap({
  destination,
  originLabel,
  onPOIClick,
  selectedPOI,
  addedPOIs = [],
}: RouteRadarMapProps) {
  const center = useMemo(() => resolveDestinationCoordinates(destination), [destination]);
  const allPOIs = useMemo(() => generatePOIsForRoute(center), [center]);
  
  // Start and end points with offset
  const startPoint = useMemo(() => withOffset(center, -0.035, -0.025), [center]);
  const endPoint = useMemo(() => withOffset(center, 0.045, 0.04), [center]);
  
  // Main route: start → end with a slight curve
  const mainRoute = useMemo<[number, number][]>(() => {
    const midLat = (startPoint.lat + endPoint.lat) / 2 + 0.008;
    const midLng = (startPoint.lng + endPoint.lng) / 2 - 0.008;
    return [
      [startPoint.lat, startPoint.lng],
      [midLat, midLng],
      [endPoint.lat, endPoint.lng]
    ];
  }, [startPoint, endPoint]);

  // Build route with added POIs
  const routeWithPOIs = useMemo(() => {
    if (addedPOIs.length === 0) return mainRoute;
    
    // Sort added POIs by proximity to start
    const sorted = [...addedPOIs].sort((a, b) => {
      const distA = Math.abs(a.position.lat - startPoint.lat) + Math.abs(a.position.lng - startPoint.lng);
      const distB = Math.abs(b.position.lat - startPoint.lat) + Math.abs(b.position.lng - startPoint.lng);
      return distA - distB;
    });
    
    const points: [number, number][] = [[startPoint.lat, startPoint.lng]];
    sorted.forEach(poi => {
      points.push([poi.position.lat, poi.position.lng]);
    });
    points.push([endPoint.lat, endPoint.lng]);
    
    return points;
  }, [mainRoute, addedPOIs, startPoint, endPoint]);

  const addedPOIIds = useMemo(() => new Set(addedPOIs.map(p => p.id)), [addedPOIs]);

  // Debug log
  console.log("RouteRadarMap rendering with", allPOIs.length, "POIs");

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      
      {/* Main route - Google Maps style */}
      <Polyline 
        positions={routeWithPOIs} 
        pathOptions={{ 
          color: addedPOIs.length > 0 ? '#0D9488' : '#0D9488', 
          weight: 5, 
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }} 
      />
      
      {/* Route glow effect */}
      <Polyline 
        positions={routeWithPOIs} 
        pathOptions={{ 
          color: 'rgba(13,148,136,0.2)', 
          weight: 12, 
          opacity: 0.3,
          lineCap: 'round',
          lineJoin: 'round',
        }} 
      />
      
      {/* Start marker */}
      <Marker
        position={[startPoint.lat, startPoint.lng]}
        icon={createRouteMarker('start', 'S')}
      >
        <Popup>
          <div className="font-bold">{originLabel || 'Pickup'}</div>
          <div className="text-xs text-muted-foreground">Starting point</div>
        </Popup>
      </Marker>
      
      {/* Destination marker */}
      <Marker
        position={[endPoint.lat, endPoint.lng]}
        icon={createRouteMarker('destination', 'D')}
      >
        <Popup>
          <div className="font-bold">{destination}</div>
          <div className="text-xs text-muted-foreground">Destination</div>
        </Popup>
      </Marker>
      
      {/* POI markers - only show if not added */}
      {allPOIs.map((poi) => {
        if (addedPOIIds.has(poi.id)) return null;
        
        const isSelected = selectedPOI?.id === poi.id;
        const icon = createPOIIcon(poi.icon, isSelected, false);
        
        return (
          <Marker
            key={poi.id}
            position={[poi.position.lat, poi.position.lng]}
            icon={icon}
            eventHandlers={{
              click: () => {
                console.log("POI clicked:", poi.name);
                if (onPOIClick) {
                  onPOIClick(poi);
                } else {
                  console.warn("onPOIClick is not defined!");
                }
              },
            }}
          >
            <Popup>
              <div className="text-center max-w-50 p-1">
                <div className="text-3xl mb-1">{poi.icon}</div>
                <strong className="block text-sm text-ink">{poi.name}</strong>
                <span className="text-xs text-ink-muted capitalize">{poi.type}</span>
                <div className="mt-1 text-xs text-ink-muted">⭐ {poi.rating} · {poi.detourTime}</div>
                <button 
                  className="mt-2 px-4 py-1.5 text-xs font-bold text-white bg-teal rounded-lg hover:bg-teal-dark transition-colors"
                  onClick={() => {
                    console.log("Popup button clicked:", poi.name);
                    if (onPOIClick) {
                      onPOIClick(poi);
                    }
                  }}
                >
                  Chat about this stop
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
      
      <RecenterOnDestinationChange center={center} />
    </MapContainer>
  );
}