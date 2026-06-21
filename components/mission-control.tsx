'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, LogOut, Navigation, AlertCircle } from 'lucide-react';

interface MissionControlProps {
  droneConnected: boolean;
  missionActive: boolean;
  onConnect: () => void;
  onArmTakeoff: () => void;
  onStartMission: () => void;
  onStopMission: () => void;
  onRTL: () => void;
  onLand: () => void;
  loading: boolean;
}

export function MissionControl({
  droneConnected,
  missionActive,
  onConnect,
  onArmTakeoff,
  onStartMission,
  onStopMission,
  onRTL,
  onLand,
  loading,
}: MissionControlProps) {
  const [showDanger, setShowDanger] = useState(false);

  return (
    <div className="space-y-3">
      {/* Connection Status */}
      <div className={`backdrop-blur-md rounded-lg p-3 flex items-center justify-between border transition-all ${
        droneConnected 
          ? 'bg-green-500/15 border-green-400/40 shadow-lg shadow-green-500/10' 
          : 'bg-red-500/15 border-red-400/40 shadow-lg shadow-red-500/10'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${droneConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
          <span className="text-xs font-mono font-semibold">
            {droneConnected ? 'CONNECTED' : 'OFFLINE'}
          </span>
        </div>
        <Button
          size="sm"
          variant={droneConnected ? 'outline' : 'default'}
          onClick={onConnect}
          disabled={loading || droneConnected}
          className={`text-xs py-1 px-2 ${droneConnected ? 'border-green-400/50 text-green-300 hover:bg-green-400/10' : 'bg-primary hover:bg-primary/90'}`}
        >
          {droneConnected ? 'Active' : 'Connect'}
        </Button>
      </div>

      {/* Mission Status */}
      {droneConnected && (
        <div className={`backdrop-blur-md rounded-lg p-3 flex items-center justify-between border transition-all ${
          missionActive 
            ? 'bg-primary/15 border-primary/40 shadow-lg shadow-primary/10' 
            : 'bg-muted/10 border-border/50'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${missionActive ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
            <span className="text-xs font-mono font-semibold">
              {missionActive ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      {droneConnected && !missionActive && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onArmTakeoff}
            disabled={loading}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground text-xs font-semibold py-2 border-0 shadow-lg shadow-primary/20 btn-glow"
          >
            Arm & Takeoff
          </Button>
          <Button
            onClick={onStartMission}
            disabled={loading}
            className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground text-xs font-semibold py-2 border-0 shadow-lg shadow-accent/20 btn-glow"
          >
            <Play className="w-3 h-3 mr-1" />
            Mission
          </Button>
        </div>
      )}

      {/* Active Mission Controls */}
      {droneConnected && missionActive && (
        <div className="space-y-2">
          <Button
            onClick={onStopMission}
            disabled={loading}
            className="w-full bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold py-2 shadow-lg shadow-red-600/20 border-0"
          >
            <Square className="w-3 h-3 mr-1" />
            Stop Mission
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={onRTL}
              disabled={loading}
              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 text-xs font-semibold py-2 shadow-lg shadow-primary/10"
            >
              <Navigation className="w-3 h-3 mr-1" />
              RTL
            </Button>
            <Button
              onClick={onLand}
              disabled={loading}
              className="bg-accent/20 hover:bg-accent/30 text-accent border border-accent/50 text-xs font-semibold py-2 shadow-lg shadow-accent/10"
            >
              Land
            </Button>
          </div>
        </div>
      )}

      {/* Emergency Section */}
      <div className="pt-3 border-t border-border/50">
        <button
          onClick={() => setShowDanger(!showDanger)}
          className="w-full flex items-center justify-between p-2 hover:bg-red-500/15 rounded-lg text-xs font-mono text-red-400/70 hover:text-red-300 transition"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" />
            Emergency
          </div>
          <span className="text-xs">{showDanger ? '▼' : '▶'}</span>
        </button>

        {showDanger && (
          <div className="mt-2 p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg space-y-2">
            <Button
              onClick={onRTL}
              disabled={loading}
              className="w-full bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold py-2 shadow-lg shadow-red-600/20 border-0"
            >
              Return to Launch
            </Button>
            <Button
              onClick={onLand}
              disabled={loading}
              className="w-full bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold py-2 shadow-lg shadow-red-600/20 border-0"
            >
              Land Immediately
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
