'use client';

import { Camera } from 'lucide-react';

interface VideoFeedProps {
  isStreaming: boolean;
  detectionCount: number;
}

export function VideoFeed({ isStreaming, detectionCount }: VideoFeedProps) {
  return (
    <div className="relative w-full h-full bg-background border border-border rounded-lg overflow-hidden">
      {/* Video Area */}
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
        {/* Camera Placeholder with Grid */}
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute w-full border-t border-cyan-400"
                style={{ top: `${(i + 1) * 25}%` }}
              />
            ))}
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute h-full border-l border-cyan-400"
                style={{ left: `${(i + 1) * 25}%` }}
              />
            ))}
          </div>

          {/* Center Circle */}
          <div className="relative w-24 h-24 rounded-full border-2 border-cyan-400 opacity-30">
            <div className="absolute inset-2 rounded-full border border-cyan-400/50" />
          </div>

          {/* Camera Icon */}
          <div className="absolute">
            <Camera className="w-12 h-12 text-muted-foreground" />
          </div>
        </div>

        {/* Status Overlay */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-xs font-mono text-muted-foreground">
            {isStreaming ? 'RECORDING' : 'STANDBY'}
          </span>
        </div>

        {/* Detection Counter */}
        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur border border-border rounded px-2 py-1">
          <div className="text-xs font-mono text-muted-foreground">DETECTIONS</div>
          <div className="text-lg font-bold text-accent">{detectionCount}</div>
        </div>

        {/* Reticle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-16 h-16">
            {/* Horizontal line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent transform -translate-y-1/2" />
            {/* Vertical line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gradient-to-b from-transparent via-cyan-400 to-transparent transform -translate-x-1/2" />
            {/* Corner marks */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
          </div>
        </div>

        {/* FPS Counter */}
        <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur border border-border rounded px-2 py-1">
          <div className="text-xs font-mono text-muted-foreground">FPS: <span className="text-cyan-400">10</span></div>
        </div>
      </div>
    </div>
  );
}
