"""
DroneKit wrapper for ArduPilot SITL control and telemetry
"""
import time
import asyncio
from typing import Callable, Optional
from dronekit import connect, VehicleMode, LocationGlobalRelative
from pymavlink.dialects.v10 import mavutil
import config

class DroneController:
    def __init__(self):
        self.vehicle = None
        self.is_armed = False
        self.is_flying = False
        self.telemetry_callback = None
        self.detected_markers = []
        
    async def connect_to_sitl(self) -> bool:
        """Connect to ArduPilot SITL"""
        try:
            connection_string = f"tcp:{config.SITL_HOST}:{config.SITL_PORT}"
            print(f"[Drone] Connecting to SITL at {connection_string}...")
            self.vehicle = connect(connection_string, wait_ready=True, timeout=30)
            print(f"[Drone] Connected! Vehicle info:")
            print(f"  - Autopilot: {self.vehicle.autopilot}")
            print(f"  - Armed: {self.vehicle.armed}")
            print(f"  - Mode: {self.vehicle.mode.name}")
            print(f"  - Location: {self.vehicle.location.global_frame}")
            return True
        except Exception as e:
            print(f"[Drone] Connection failed: {e}")
            return False
    
    async def arm_and_takeoff(self, target_altitude: float) -> bool:
        """Arm the drone and take off to target altitude"""
        if not self.vehicle:
            print("[Drone] Not connected!")
            return False
            
        try:
            print(f"[Drone] Arming and taking off to {target_altitude}m...")
            
            # Pre-arm checks
            while not self.vehicle.is_armable:
                print("[Drone] Waiting for vehicle to be armable...")
                await asyncio.sleep(1)
            
            # Set mode to GUIDED
            self.vehicle.mode = VehicleMode("GUIDED")
            while self.vehicle.mode.name != "GUIDED":
                print(f"[Drone] Setting mode to GUIDED (currently {self.vehicle.mode.name})...")
                await asyncio.sleep(1)
            
            # Arm
            self.vehicle.armed = True
            while not self.vehicle.armed:
                print("[Drone] Waiting for arm...")
                await asyncio.sleep(1)
            
            print("[Drone] Armed!")
            self.is_armed = True
            
            # Takeoff
            self.vehicle.simple_takeoff(target_altitude)
            
            # Wait for altitude
            while True:
                current_alt = self.vehicle.location.global_relative_frame.alt
                print(f"[Drone] Altitude: {current_alt:.1f}m / {target_altitude}m")
                
                if current_alt >= target_altitude * 0.95:
                    print(f"[Drone] Reached target altitude!")
                    self.is_flying = True
                    break
                await asyncio.sleep(1)
            
            return True
        except Exception as e:
            print(f"[Drone] Arm/takeoff failed: {e}")
            return False
    
    async def fly_to_waypoint(self, lat: float, lon: float, alt: float) -> bool:
        """Fly to a specific waypoint"""
        if not self.vehicle or not self.is_flying:
            return False
        
        try:
            point = LocationGlobalRelative(lat, lon, alt)
            self.vehicle.simple_goto(point)
            print(f"[Drone] Flying to waypoint: {lat:.4f}, {lon:.4f}, {alt}m")
            return True
        except Exception as e:
            print(f"[Drone] Waypoint flight failed: {e}")
            return False
    
    async def return_to_launch(self) -> bool:
        """Return to home location"""
        if not self.vehicle:
            return False
        
        try:
            print("[Drone] Returning to launch...")
            self.vehicle.mode = VehicleMode("RTL")
            while self.vehicle.mode.name != "RTL":
                await asyncio.sleep(0.5)
            print("[Drone] RTL mode set")
            return True
        except Exception as e:
            print(f"[Drone] RTL failed: {e}")
            return False
    
    async def land(self) -> bool:
        """Land the drone"""
        if not self.vehicle:
            return False
        
        try:
            print("[Drone] Landing...")
            self.vehicle.mode = VehicleMode("LAND")
            while self.vehicle.mode.name != "LAND":
                await asyncio.sleep(0.5)
            print("[Drone] LAND mode set")
            return True
        except Exception as e:
            print(f"[Drone] Land failed: {e}")
            return False
    
    async def disarm(self) -> bool:
        """Disarm the drone"""
        if not self.vehicle:
            return False
        
        try:
            print("[Drone] Disarming...")
            self.vehicle.armed = False
            while self.vehicle.armed:
                await asyncio.sleep(0.5)
            self.is_armed = False
            self.is_flying = False
            print("[Drone] Disarmed")
            return True
        except Exception as e:
            print(f"[Drone] Disarm failed: {e}")
            return False
    
    def get_telemetry(self) -> dict:
        """Get current telemetry snapshot"""
        if not self.vehicle:
            return {}
        
        return {
            "latitude": self.vehicle.location.global_frame.lat,
            "longitude": self.vehicle.location.global_frame.lon,
            "altitude": self.vehicle.location.global_relative_frame.alt,
            "armed": self.vehicle.armed,
            "mode": self.vehicle.mode.name,
            "battery_voltage": self.vehicle.battery.voltage,
            "battery_current": self.vehicle.battery.current,
            "battery_level": self.vehicle.battery.level,
            "groundspeed": self.vehicle.groundspeed,
            "airspeed": self.vehicle.airspeed,
            "heading": self.vehicle.heading,
            "is_armable": self.vehicle.is_armable,
        }
    
    def register_telemetry_callback(self, callback: Callable):
        """Register callback for telemetry updates"""
        self.telemetry_callback = callback
    
    def add_detected_marker(self, lat: float, lon: float, confidence: float):
        """Log a detected marker/survivor location"""
        marker = {
            "latitude": lat,
            "longitude": lon,
            "confidence": confidence,
            "timestamp": time.time()
        }
        self.detected_markers.append(marker)
        print(f"[Drone] Marker detected at {lat:.4f}, {lon:.4f} (confidence: {confidence:.2f})")
    
    def close(self):
        """Close vehicle connection"""
        if self.vehicle:
            self.vehicle.close()
            print("[Drone] Connection closed")
