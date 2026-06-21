'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MissionStatusProps {
  totalWaypoints: number;
  completedWaypoints: number;
  progressPercent: number;
  markersFound: number;
  markersHistory: Array<{ latitude: number; longitude: number; confidence: number; timestamp: number }>;
}

export function MissionStatus({
  totalWaypoints,
  completedWaypoints,
  progressPercent,
  markersFound,
  markersHistory,
}: MissionStatusProps) {
  const chartData = markersHistory.slice(-20).map((m, i) => ({
    name: `M${i + 1}`,
    confidence: Math.round(m.confidence * 100),
  }));

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-mono text-muted-foreground">MISSION PROGRESS</span>
          <span className="text-sm font-mono text-primary">{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-background rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground font-mono">
          <span>Waypoint {completedWaypoints}/{totalWaypoints}</span>
          <span>{totalWaypoints > 0 ? ((completedWaypoints / totalWaypoints) * 100).toFixed(0) : 0}%</span>
        </div>
      </div>

      {/* Markers Found */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-mono text-muted-foreground">DETECTIONS</span>
          <span className="text-2xl font-bold text-accent">{markersFound}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {markersFound > 0 ? `${markersFound} survivor(s) located` : 'Searching...'}
        </div>
      </div>

      {/* Detection History Chart */}
      {chartData.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm font-mono text-muted-foreground mb-3">DETECTION CONFIDENCE</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111630', border: '1px solid #1f2937' }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Bar dataKey="confidence" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Detections */}
      {markersHistory.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm font-mono text-muted-foreground mb-3">RECENT DETECTIONS</div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {markersHistory.slice().reverse().slice(0, 5).map((marker, i) => (
              <div key={i} className="text-xs p-2 bg-background rounded border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-muted-foreground">Detection #{markersHistory.length - i}</span>
                  <span className="text-accent font-bold">{(marker.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="text-muted-foreground mt-1">
                  {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
