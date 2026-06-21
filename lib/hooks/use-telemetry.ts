declare module 'react' {
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[] | undefined): void;
  export function useState<S>(initialState: S | (() => S)): [S, (value: S | ((prevState: S) => S)) => void];
  export function useRef<T>(initialValue: T): { current: T };
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[] | undefined): T;
}

import { useEffect, useState, useRef, useCallback } from 'react';




// Avoid NodeJS namespace types in browser builds.
type NodeTimer = ReturnType<typeof setTimeout>;

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
  total_waypoints?: number;
  completed_waypoints?: number;
  progress_percent?: number;
}

export function useTelemetry(enabled: boolean = true) {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [markers, setMarkers] = useState<Array<any>>([]);
  const MAX_MARKERS = 200;

  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeTimer | null>(null);


  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      // Connect to backend WebSocket
      const wsUrl = `ws://${window.location.hostname}:8765/ws/telemetry`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('[Telemetry] WebSocket connected');
        setIsConnected(true);
      };

      wsRef.current.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data as string);


          if (message.type === 'telemetry') {
            setTelemetry(message.data);
          } else if (message.type === 'marker_detected') {
            setMarkers((prev: Array<any>) => {
              const next = [...prev, message.data];

              return next.length > MAX_MARKERS ? next.slice(next.length - MAX_MARKERS) : next;
            });
          } else if (message.type === 'mission_complete') {
            console.log('[Telemetry] Mission complete:', message.data);
          }

        } catch (error) {
          console.error('[Telemetry] Parse error:', error);
        }
      };

      wsRef.current.onerror = (error: Event) => {
        console.error('[Telemetry] WebSocket error:', error);

        setIsConnected(false);
      };

      wsRef.current.onclose = () => {
        console.log('[Telemetry] WebSocket disconnected');
        setIsConnected(false);
        // Attempt reconnect
        if (enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        }
      };
    } catch (error) {
      console.error('[Telemetry] Connection error:', error);
      setIsConnected(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [enabled, connect]);

  return {
    telemetry,
    markers,
    isConnected,
    setMarkers,
  };
}
