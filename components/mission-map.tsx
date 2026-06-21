'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for marker icons in Next.js
const droneIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI4IiBmaWxsPSIjM2I4MmY2Ii8+PHBvbHlnb24gcG9pbnRzPSIxMiw0IDE2LDEyIDEyLDIwIDgsIDEyIiBmaWxsPSIjMDZiNmQ0Ii8+PC9zdmc+',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const markerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI2IiBmaWxsPSIjZWY0NDQ0Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMyIgZmlsbD0iI2ZmYzEwNyIvPjwvc3ZnPg==',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const homeIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSI2IiB5PSI5IiB3aWR0aD0iMTIiIGhlaWdodD0iOCIgZmlsbD0iIzA2YjZkNCIvPjxwb2x5Z29uIHBvaW50cz0iMTIsNCAxOCw5IDYsOSIgZmlsbD0iIzA2YjZkNCIvPjwvc3ZnPg==',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface MissionMapProps {
  dronePosition: { lat: number; lon: number } | null;
  homePosition: { lat: number; lon: number };
  waypoints: Array<[number, number]>;
  detections: Array<{ latitude: number; longitude: number; confidence: number }>;
  flightPath: Array<[number, number]>;
}

export function MissionMap({
  dronePosition,
  homePosition,
  waypoints,
  detections,
  flightPath,
}: MissionMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-full bg-card border border-border rounded-lg flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading map...</div>
      </div>
    );
  }

  const mapCenter = dronePosition ? [dronePosition.lat, dronePosition.lon] : [homePosition.lat, homePosition.lon];

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={[mapCenter[0], mapCenter[1]]}
        zoom={18}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />

        {/* Home Location */}
        <Marker position={[homePosition.lat, homePosition.lon]} icon={homeIcon}>
          <Popup>
            <div className="text-sm font-mono">
              <div>Home Location</div>
              <div className="text-xs text-muted-foreground">
                {homePosition.lat.toFixed(4)}, {homePosition.lon.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Waypoints */}
        {waypoints.map((wp, i) => (
          <Marker key={`wp-${i}`} position={[wp[0], wp[1]]} icon={homeIcon} opacity={0.3}>
            <Popup>
              <div className="text-sm font-mono">
                <div>Waypoint {i + 1}</div>
                <div className="text-xs text-muted-foreground">
                  {wp[0].toFixed(4)}, {wp[1].toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Flight Path */}
        {flightPath.length > 1 && (
          <Polyline
            positions={flightPath.map(p => [p[0], p[1]])}
            color="#3b82f6"
            weight={2}
            opacity={0.7}
            dashArray="5, 5"
          />
        )}

        {/* Drone Current Position */}
        {dronePosition && (
          <Marker position={[dronePosition.lat, dronePosition.lon]} icon={droneIcon}>
            <Popup>
              <div className="text-sm font-mono">
                <div className="text-primary font-bold">Drone Position</div>
                <div className="text-xs text-muted-foreground">
                  {dronePosition.lat.toFixed(4)}, {dronePosition.lon.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Detection Markers */}
        {detections.map((detection, i) => (
          <Marker key={`detection-${i}`} position={[detection.latitude, detection.longitude]} icon={markerIcon}>
            <Popup>
              <div className="text-sm font-mono">
                <div className="text-accent font-bold">Detection {i + 1}</div>
                <div className="text-xs text-muted-foreground">
                  Confidence: {(detection.confidence * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {detection.latitude.toFixed(4)}, {detection.longitude.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
