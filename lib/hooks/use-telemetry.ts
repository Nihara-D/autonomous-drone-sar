import { useEffect, useState, useRef, useCallback } from 'react';

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
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'telemetry') {
            setTelemetry(message.data);
          } else if (message.type === 'marker_detected') {
            setMarkers((prev) => [...prev, message.data]);
          } else if (message.type === 'mission_complete') {
            console.log('[Telemetry] Mission complete:', message.data);
          }
        } catch (error) {
          console.error('[Telemetry] Parse error:', error);
        }
      };

      wsRef.current.onerror = (error) => {
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
