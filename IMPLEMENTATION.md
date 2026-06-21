# Autonomous Drone SAR System - Implementation Summary

**Project:** Autonomous Search & Rescue Drone Simulation  
**Author:** Nihara Dayarathne (shniharard@gmail.com)  
**Status:** Complete

---

## What Was Built

### Backend (Python + FastAPI)
- **Drone Controller** (`backend/src/drone_controller.py`) - DroneKit wrapper for SITL communication
- **Mission Planner** (`backend/src/mission_planner.py`) - Grid search waypoint generation with lawn-mower algorithm
- **Vision System** (`backend/src/vision_system.py`) - OpenCV marker detection with HSV color filtering
- **FastAPI Server** (`backend/main.py`) - RESTful API and WebSocket server for real-time telemetry
- **Configuration** (`backend/config.py`) - Centralized settings for SITL, grid, and vision parameters

### Frontend (Next.js 16 + React)
- **Dashboard** (`app/page.tsx`) - Main interface with responsive layout
- **Telemetry Display** (`components/telemetry-display.tsx`) - Real-time status indicators (altitude, speed, heading, battery, GPS)
- **Mission Control** (`components/mission-control.tsx`) - Command buttons (arm, takeoff, start mission, RTL, land)
- **Mission Map** (`components/mission-map.tsx`) - Leaflet-based interactive map with drone tracking, waypoints, and detection markers
- **Mission Status** (`components/mission-status.tsx`) - Progress tracking and detection history
- **Video Feed** (`components/video-feed.tsx`) - Simulated camera display with detection overlay
- **API Client** (`lib/api-client.ts`) - HTTP and WebSocket communication utilities
- **Telemetry Hook** (`lib/hooks/use-telemetry.ts`) - Real-time WebSocket data management with auto-reconnect

### Infrastructure
- **Docker Setup** - Multi-container orchestration with FastAPI backend and Next.js frontend
- **Configuration Templates** - `.env.example` for environment variable setup
- **Helper Scripts** - Startup scripts for SITL, backend, and frontend

---

## Core Features Implemented

✓ **Autonomous Grid Search** - Automatic waypoint generation in configurable lawn-mower pattern  
✓ **Real-time Telemetry Streaming** - WebSocket connection at 10 Hz update rate  
✓ **Marker Detection** - OpenCV-based colored object detection with confidence scoring  
✓ **Interactive Mission Map** - Live drone position tracking with waypoint and detection visualization  
✓ **Mission Control Interface** - One-click commands for arm, takeoff, start mission, RTL, land  
✓ **Emergency Controls** - Safe mission abort and return-to-home functionality  
✓ **API Design** - 10+ RESTful endpoints with proper error handling  
✓ **Dark Theme UI** - Professional dashboard with tech-focused aesthetic  

---

## Technical Specifications

| Component | Technology | Details |
|-----------|-----------|---------|
| **Backend** | Python 3.10+, FastAPI | DroneKit integration for SITL control |
| **Frontend** | Next.js 16, React 19, TypeScript | Server/Client components with Tailwind CSS |
| **Simulation** | ArduPilot SITL, MAVLink | Full flight controller simulation |
| **Vision** | OpenCV, NumPy | Real-time marker detection and tracking |
| **Real-time** | WebSocket | Bidirectional communication for telemetry |
| **Mapping** | Leaflet, React Leaflet | Interactive map with marker visualization |
| **Deployment** | Docker, Docker Compose | Multi-service containerization |

---

## File Organization

```
Project Root
├── app/                      # Next.js frontend
│   ├── page.tsx             # Dashboard
│   ├── layout.tsx           # Root layout with metadata
│   └── globals.css          # Tailwind dark theme
├── components/              # React components (6 total)
├── lib/                     # Utilities and hooks
├── backend/                 # Python backend
│   ├── main.py             # FastAPI server (307 lines)
│   ├── config.py           # Configuration (36 lines)
│   ├── requirements.txt     # Dependencies
│   └── src/                # Core modules
├── scripts/                # Helper scripts
├── Dockerfile              # Container setup
├── docker-compose.yml      # Multi-service orchestration
├── package.json            # Node.js metadata
└── README.md              # Clean, professional documentation
```

---

## How to Run

### Option 1: Docker (Fastest)
```bash
docker-compose up
# Open http://localhost:3000
```

### Option 2: Local Setup
```bash
# Terminal 1: SITL Simulator
sim_vehicle.py -v ArduCopter --home=6.9271,79.8612,0,0

# Terminal 2: Backend
cd backend && python main.py

# Terminal 3: Frontend
pnpm dev
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/drone/connect` | Establish SITL connection |
| POST | `/api/drone/arm-takeoff` | Arm and takeoff |
| POST | `/api/drone/rtl` | Return to home |
| POST | `/api/drone/land` | Land aircraft |
| GET | `/api/telemetry` | Get current status |
| POST | `/api/mission/start` | Begin autonomous mission |
| POST | `/api/mission/stop` | Stop active mission |
| GET | `/api/detections` | Retrieve detected markers |
| WS | `/ws/telemetry` | Real-time telemetry stream |

---

## Dependencies Summary

### Python (backend/requirements.txt)
- fastapi, uvicorn - Web server
- dronekit, pymavlink - Drone control
- opencv-python, numpy - Computer vision
- python-multipart, websockets - API support

### Node.js (package.json)
- next, react - Frontend framework
- leaflet, react-leaflet - Mapping
- recharts - Charts
- zustand, swr - State management
- tailwindcss - Styling

---

## Customization Points

Edit `backend/config.py` to modify:
- **Grid Parameters:** altitude, spacing, search area size
- **Vision Settings:** marker color HSV range, confidence threshold, minimum area
- **SITL Connection:** host, port, telemetry frequency
- **Coordinates:** home location (latitude, longitude)

---

## Known Limitations

- Simulation-only (no real hardware integration in current version)
- Single marker color detection per mission
- No obstacle avoidance algorithm
- Gazebo integration optional

---

## Next Steps for Extension

1. Real hardware integration with Pixhawk flight controller
2. Multi-color or multi-target detection
3. Obstacle avoidance using sensor fusion
4. Mission logging and replay functionality
5. Web-based mission planning and download

---

## Author

**Nihara Dayarathne**  
Email: shniharard@gmail.com

---

## License

MIT License - Free to use and modify for research and educational purposes.
