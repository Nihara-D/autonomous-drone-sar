'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { TelemetryDisplay } from '@/components/telemetry-display';
import { MissionControl } from '@/components/mission-control';
import { MissionStatus } from '@/components/mission-status';
import { VideoFeed } from '@/components/video-feed';
import { AnimatedDrones } from '@/components/animated-drones';
import { apiClient } from '@/lib/api-client';
import { useTelemetry } from '@/lib/hooks/use-telemetry';

const MissionMap = dynamic(() => import('@/components/mission-map').then(m => ({ default: m.MissionMap })), {
  loading: () => <div className="w-full h-full bg-card flex items-center justify-center">Loading map...</div>,
  ssr: false,
});

const DEFAULT_HOME = { lat: 6.9271, lon: 79.8612 };

export default function Dashboard() {
  const [droneConnected, setDroneConnected] = useState(false);
  const [missionActive, setMissionActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waypoints, setWaypoints] = useState<Array<[number, number]>>([]);
  const [flightPath, setFlightPath] = useState<Array<[number, number]>>([]);

  const { telemetry, markers, isConnected } = useTelemetry(droneConnected);

  // Initialize mission on load
  useEffect(() => {
    const initialize = async () => {
      try {
        const mission = await apiClient.generateGridMission(
          DEFAULT_HOME.lat,
          DEFAULT_HOME.lon,
          500, // grid size
          50,  // spacing
          30   // altitude
        );
        if (mission.waypoints) {
          setWaypoints(mission.waypoints.map((wp: any) => [wp[0], wp[1]]));
        }
      } catch (error) {
        console.error('[Dashboard] Failed to generate mission:', error);
      }
    };

    initialize();
  }, []);

  // Update flight path from telemetry
  useEffect(() => {
    if (telemetry?.latitude && telemetry?.longitude) {
      setFlightPath((prev) => {
        // Only add if significantly different from last point
        if (prev.length === 0 || 
            Math.abs(prev[prev.length - 1][0] - telemetry.latitude) > 0.00001 ||
            Math.abs(prev[prev.length - 1][1] - telemetry.longitude) > 0.00001) {
          return [...prev, [telemetry.latitude, telemetry.longitude]];
        }
        return prev;
      });
    }
  }, [telemetry?.latitude, telemetry?.longitude]);

  const handleConnect = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiClient.connectDrone();
      if (result.success) {
        setDroneConnected(true);
      }
    } catch (error) {
      console.error('[Dashboard] Connection failed:', error);
    }
    setLoading(false);
  }, []);

  const handleArmTakeoff = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiClient.armAndTakeoff(30);
      if (result.success) {
        console.log('[Dashboard] Armed and taking off');
      }
    } catch (error) {
      console.error('[Dashboard] Arm/takeoff failed:', error);
    }
    setLoading(false);
  }, []);

  const handleStartMission = useCallback(async () => {
    setLoading(true);
    try {
      if (waypoints.length === 0) {
        // Generate mission if not already generated
        const mission = await apiClient.generateGridMission(DEFAULT_HOME.lat, DEFAULT_HOME.lon);
        if (mission.waypoints) {
          setWaypoints(mission.waypoints.map((wp: any) => [wp[0], wp[1]]));
        }
      }

      const result = await apiClient.startMission();
      if (result.success) {
        setMissionActive(true);
      }
    } catch (error) {
      console.error('[Dashboard] Mission start failed:', error);
    }
    setLoading(false);
  }, [waypoints]);

  const handleStopMission = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiClient.stopMission();
      if (result.success) {
        setMissionActive(false);
      }
    } catch (error) {
      console.error('[Dashboard] Mission stop failed:', error);
    }
    setLoading(false);
  }, []);

  const handleRTL = useCallback(async () => {
    setLoading(true);
    try {
      await apiClient.rtl();
    } catch (error) {
      console.error('[Dashboard] RTL failed:', error);
    }
    setLoading(false);
  }, []);

  const handleLand = useCallback(async () => {
    setLoading(true);
    try {
      await apiClient.land();
    } catch (error) {
      console.error('[Dashboard] Land failed:', error);
    }
    setLoading(false);
  }, []);

  const dronePos = telemetry ? {
    lat: telemetry.latitude,
    lon: telemetry.longitude,
  } : null;

  const missionProgress = telemetry ? {
    totalWaypoints: telemetry.total_waypoints || waypoints.length,
    completedWaypoints: telemetry.completed_waypoints || 0,
    progressPercent: telemetry.progress_percent || 0,
  } : { totalWaypoints: 0, completedWaypoints: 0, progressPercent: 0 };

  return (
    <main className="min-h-screen text-foreground overflow-hidden">
      {/* Animated drone background */}
      <AnimatedDrones />

      {/* Header */}
      <header className="border-b border-border/50 glass relative z-20 sticky top-0 shadow-lg shadow-primary/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Autonomous Drone SAR
            </h1>
            <p className="text-sm text-muted-foreground font-mono mt-1">Real-time Mission Control & Telemetry</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg text-sm font-mono font-semibold transition-all ${
              droneConnected 
                ? 'bg-green-500/20 text-green-300 border border-green-400/50 shadow-lg shadow-green-500/20'
                : 'bg-red-500/20 text-red-300 border border-red-400/50 shadow-lg shadow-red-500/20'
            }`}>
              <span className="animate-pulse">●</span> {droneConnected ? 'CONNECTED' : 'OFFLINE'}
            </div>
            <div className={`px-4 py-2 rounded-lg text-sm font-mono font-semibold transition-all ${
              missionActive
                ? 'bg-primary/20 text-primary border border-primary/50 shadow-lg shadow-primary/20'
                : 'bg-muted/20 text-muted-foreground border border-border shadow-lg shadow-muted/10'
            }`}>
              <span className="animate-pulse">●</span> {missionActive ? 'ACTIVE' : 'READY'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel: Control & Status */}
          <div className="lg:col-span-1 space-y-6">
            {/* Mission Control */}
            <div className="glass glow-primary p-5 rounded-xl">
              <h2 className="text-xs font-mono text-primary font-bold mb-4 uppercase tracking-widest">Mission Control</h2>
              <MissionControl
                droneConnected={droneConnected}
                missionActive={missionActive}
                onConnect={handleConnect}
                onArmTakeoff={handleArmTakeoff}
                onStartMission={handleStartMission}
                onStopMission={handleStopMission}
                onRTL={handleRTL}
                onLand={handleLand}
                loading={loading}
              />
            </div>

            {/* Telemetry */}
            <div className="glass glow-accent p-5 rounded-xl">
              <h2 className="text-xs font-mono text-accent font-bold mb-4 uppercase tracking-widest">Live Telemetry</h2>
              <TelemetryDisplay data={telemetry || null} />
            </div>
          </div>

          {/* Center Panel: Map & Video */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <div className="glass glow-primary rounded-xl overflow-hidden shadow-2xl" style={{ height: '420px' }}>
              <MissionMap
                dronePosition={dronePos}
                homePosition={DEFAULT_HOME}
                waypoints={waypoints}
                detections={markers}
                flightPath={flightPath}
              />
            </div>

            {/* Video Feed */}
            <div className="glass glow-secondary rounded-xl overflow-hidden shadow-2xl" style={{ height: '310px' }}>
              <VideoFeed isStreaming={missionActive} detectionCount={markers.length} />
            </div>
          </div>

          {/* Right Panel: Status & Detections */}
          <div className="lg:col-span-1">
            <div className="glass glow-accent p-5 rounded-xl shadow-2xl h-full">
              <h2 className="text-xs font-mono text-accent font-bold mb-4 uppercase tracking-widest">Mission Status</h2>
              <MissionStatus
                totalWaypoints={missionProgress.totalWaypoints}
                completedWaypoints={missionProgress.completedWaypoints}
                progressPercent={missionProgress.progressPercent}
                markersFound={markers.length}
                markersHistory={markers}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 border-t border-border/30 pt-6 text-center space-y-2">
          <div className="text-xs text-muted-foreground font-mono">
            <div className="font-semibold text-foreground mb-2">Autonomous Drone Search & Rescue System</div>
            <div>ArduPilot SITL • DroneKit-Python • OpenCV Vision</div>
            <div className="text-primary/60">Backend: FastAPI | Frontend: Next.js 16 | Real-time: WebSocket Telemetry</div>
          </div>
        </div>
      </div>
    </main>
  );
}
