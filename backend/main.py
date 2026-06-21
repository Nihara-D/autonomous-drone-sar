"""
FastAPI backend for Autonomous Drone SAR System
Handles MAVLink/DroneKit integration, mission planning, and vision processing
"""
import asyncio
import json
import cv2
import numpy as np
from fastapi import FastAPI, WebSocket, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

import config
from drone_controller import DroneController
from mission_planner import MissionPlanner
from vision_system import VisionSystem

# Initialize components
app = FastAPI(title="Drone SAR Backend")
drone = DroneController()
planner = MissionPlanner()
vision = VisionSystem()

# Global state
mission_active = False
mission_task: asyncio.Task | None = None
current_frame_number = 0
connected_clients = set()


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== REST API Endpoints =====

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "drone_connected": drone.vehicle is not None,
        "mission_active": mission_active
    }

@app.post("/api/drone/connect")
async def connect_drone():
    """Connect to SITL drone"""
    try:
        success = await drone.connect_to_sitl()
        if success:
            return {"success": True, "message": "Connected to SITL"}
        else:
            return {"success": False, "message": "Failed to connect"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/drone/arm-takeoff")
async def arm_and_takeoff(altitude: float = 30.0):
    """Arm and take off"""
    try:
        success = await drone.arm_and_takeoff(altitude)
        if success:
            return {"success": True, "message": f"Takeoff to {altitude}m successful"}
        else:
            return {"success": False, "message": "Takeoff failed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/drone/rtl")
async def return_to_launch():
    """Return to launch"""
    try:
        success = await drone.return_to_launch()
        return {"success": success, "message": "RTL mode activated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/drone/land")
async def land_drone():
    """Land the drone"""
    try:
        success = await drone.land()
        return {"success": success, "message": "Land mode activated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/drone/disarm")
async def disarm_drone():
    """Disarm the drone"""
    try:
        success = await drone.disarm()
        return {"success": success, "message": "Drone disarmed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/telemetry")
async def get_telemetry():
    """Get current telemetry"""
    return drone.get_telemetry()

@app.post("/api/mission/generate-grid")
async def generate_grid_mission(
    center_lat: float = config.DEFAULT_HOME_LAT,
    center_lon: float = config.DEFAULT_HOME_LON,
    grid_size: float = config.GRID_SIZE,
    spacing: float = config.GRID_SPACING,
    altitude: float = config.GRID_SEARCH_ALTITUDE
):
    """Generate grid search mission"""
    try:
        waypoints = planner.generate_grid_search(
            center_lat, center_lon, grid_size, spacing, altitude
        )
        return {
            "success": True,
            "waypoints": [(lat, lon, alt) for lat, lon, alt in waypoints],
            "count": len(waypoints)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/mission/progress")
async def get_mission_progress():
    """Get mission progress"""
    return planner.get_mission_progress()

@app.get("/api/detections")
async def get_detections():
    """Get all detected markers"""
    return {
        "markers": drone.detected_markers,
        "vision_detections": vision.detection_history,
        "count": len(drone.detected_markers)
    }

@app.post("/api/mission/start")
async def start_autonomous_mission(background_tasks: BackgroundTasks):
    """Start autonomous grid search mission"""
    global mission_active, mission_task


    if not drone.vehicle:
        raise HTTPException(status_code=400, detail="Drone not connected")

    if mission_task and not mission_task.done():
        raise HTTPException(status_code=409, detail="Mission already running")

    if not planner.waypoints:
        raise HTTPException(status_code=400, detail="No mission waypoints generated")

    mission_active = True
    mission_task = background_tasks.add_task(autonomous_mission_loop)

    return {"success": True, "message": "Autonomous mission started"}


@app.post("/api/mission/stop")
async def stop_mission():
    """Stop autonomous mission.

    Immediately switches to RTL to match UI expectation.
    """
    global mission_active
    mission_active = False

    # Best-effort: switch mode right away.
    if drone.vehicle:
        try:
            await drone.return_to_launch()
        except Exception:
            pass

    return {"success": True, "message": "Mission stopped, initiating RTL"}


# ===== WebSocket for Real-time Telemetry =====

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    """WebSocket for real-time telemetry streaming"""
    await websocket.accept()
    connected_clients.add(websocket)
    print("[WS] Client connected")
    
    try:
        while True:
            # Send telemetry every 100ms
            telem = drone.get_telemetry()
            progress = planner.get_mission_progress()
            
            message = {
                "type": "telemetry",
                "data": {
                    **telem,
                    **progress
                }
            }
            
            await websocket.send_json(message)
            await asyncio.sleep(0.1)
    except Exception as e:
        print(f"[WS] Error: {e}")
    finally:
        connected_clients.remove(websocket)
        print("[WS] Client disconnected")

# ===== Autonomous Mission Loop =====

async def autonomous_mission_loop():
    """Main autonomous mission execution loop"""
    global mission_active, current_frame_number
    
    print("[Mission] Starting autonomous search & rescue...")
    
    if not await drone.arm_and_takeoff(config.GRID_SEARCH_ALTITUDE):
        print("[Mission] Failed to arm/takeoff")
        mission_active = False
        return
    
    planner.reset_mission()
    waypoint_timeout = 0
    
    while mission_active and planner.current_waypoint_index < len(planner.waypoints):
        waypoint = planner.get_next_waypoint()
        if not waypoint:
            break

        lat, lon, alt = waypoint

        # Send drone to waypoint and wait for arrival (deterministic mission behavior)
        sent = await drone.fly_to_waypoint(lat, lon, alt)
        if not sent:
            continue

        reached = await drone.wait_until_waypoint_reached(
            lat,
            lon,
            alt,
            horizontal_threshold_m=6.0,
            altitude_threshold_m=2.0,
            timeout_s=90.0,
            poll_interval_s=1.0,
        )
        if not reached:
            continue

        # Process vision at waypoint
        for _ in range(30):  # ~3 seconds at 10Hz
            if not mission_active:
                break

            frame = vision.simulate_camera_feed(current_frame_number)
            detections = vision.detect_red_marker(frame)
            current_frame_number += 1

            if detections:
                for detection in detections:
                    lat_offset = (detection["center"][0] - 320) / 111000
                    lon_offset = (detection["center"][1] - 240) / 111000

                    marker_lat = lat + lat_offset
                    marker_lon = lon + lon_offset

                    # Cap growth to keep WS + UI responsive
                    if len(drone.detected_markers) < 200:
                        drone.add_detected_marker(marker_lat, marker_lon, detection["confidence"])

                        for client in list(connected_clients):
                            try:
                                await client.send_json(
                                    {
                                        "type": "marker_detected",
                                        "data": {
                                            "latitude": marker_lat,
                                            "longitude": marker_lon,
                                            "confidence": detection["confidence"],
                                        },
                                    }
                                )
                            except Exception:
                                pass

            await asyncio.sleep(0.1)

    
    # Mission complete
    print("[Mission] Grid search complete, returning home")
    await drone.return_to_launch()
    mission_active = False
    
    # Broadcast mission complete
    for client in connected_clients:
        try:
            await client.send_json({
                "type": "mission_complete",
                "data": {
                    "markers_found": len(drone.detected_markers),
                    "detections": drone.detected_markers
                }
            })
        except:
            pass

# ===== Startup/Shutdown =====

@app.on_event("startup")
async def startup():
    print("[Server] Starting Drone SAR Backend...")
    print(f"[Server] API: http://{config.API_HOST}:{config.API_PORT}")
    print(f"[Server] SITL: tcp://{config.SITL_HOST}:{config.SITL_PORT}")

@app.on_event("shutdown")
async def shutdown():
    print("[Server] Shutting down...")
    drone.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=config.API_HOST,
        port=config.API_PORT,
        reload=config.RELOAD
    )
