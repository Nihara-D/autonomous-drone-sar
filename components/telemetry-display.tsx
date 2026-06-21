'use client';

import { Battery, Navigation2, Gauge, Radio, Zap } from 'lucide-react';

interface TelemetryData {
  latitude: number;
  longitude: number;
  altitude: number;
  armed: boolean;
  mode: string;
  battery_voltage: number;
  battery_current: number;
  battery_level: number;
  groundspeed: number;
  airspeed: number;
  heading: number;
  is_armable: boolean;
}

interface TelemetryDisplayProps {
  data: TelemetryData | null;
}

export function TelemetryDisplay({ data }: TelemetryDisplayProps) {
  if (!data) {
    return (
      <div className="grid grid-cols-2 gap-3 p-4">
        <div className="bg-card border border-border rounded-lg p-3 animate-pulse h-24" />
        <div className="bg-card border border-border rounded-lg p-3 animate-pulse h-24" />
        <div className="bg-card border border-border rounded-lg p-3 animate-pulse h-24" />
        <div className="bg-card border border-border rounded-lg p-3 animate-pulse h-24" />
      </div>
    );
  }

  const statusColor = data.armed ? 'text-green-400' : 'text-red-400';
  const modeColor = data.mode === 'GUIDED' ? 'text-cyan-400' : 'text-yellow-400';

  return (
    <div className="space-y-3">
      {/* Armed Status & Mode */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-muted-foreground">ARMED</span>
            <Zap className="w-4 h-4" />
          </div>
          <div className={`text-lg font-bold ${statusColor}`}>
            {data.armed ? 'YES' : 'NO'}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-muted-foreground">MODE</span>
            <Radio className="w-4 h-4" />
          </div>
          <div className={`text-lg font-bold font-mono ${modeColor}`}>
            {data.mode}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-card border border-border rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-muted-foreground">POSITION</span>
          <Navigation2 className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="text-sm font-mono">
            <span className="text-muted-foreground">Lat: </span>
            <span className="text-accent">{data.latitude.toFixed(4)}</span>
          </div>
          <div className="text-sm font-mono">
            <span className="text-muted-foreground">Lon: </span>
            <span className="text-accent">{data.longitude.toFixed(4)}</span>
          </div>
          <div className="text-sm font-mono">
            <span className="text-muted-foreground">Alt: </span>
            <span className="text-primary">{data.altitude.toFixed(1)}m</span>
          </div>
        </div>
      </div>

      {/* Speed & Heading */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-muted-foreground">GSPEED</span>
            <Gauge className="w-4 h-4" />
          </div>
          <div className="text-lg font-bold text-primary">
            {data.groundspeed.toFixed(1)} m/s
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-muted-foreground">HEADING</span>
            <Navigation2 className="w-4 h-4" />
          </div>
          <div className="text-lg font-bold text-primary">
            {data.heading.toFixed(0)}°
          </div>
        </div>
      </div>

      {/* Battery */}
      <div className="bg-card border border-border rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-muted-foreground">BATTERY</span>
          <Battery className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-muted-foreground">Voltage:</span>
            <span className="text-sm text-primary">{data.battery_voltage.toFixed(2)}V</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-muted-foreground">Current:</span>
            <span className="text-sm text-primary">{data.battery_current.toFixed(2)}A</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-muted-foreground">Level:</span>
            <span className={`text-sm font-bold ${data.battery_level >= 30 ? 'text-green-400' : 'text-red-400'}`}>
              {(data.battery_level * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
