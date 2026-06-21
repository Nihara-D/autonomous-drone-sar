"""
Configuration for the Drone SAR Backend
"""
import os
from dotenv import load_dotenv

load_dotenv()

# ArduPilot SITL Connection
SITL_HOST = os.getenv("SITL_HOST", "127.0.0.1")
SITL_PORT = int(os.getenv("SITL_PORT", "14550"))

# Simulation Default Home Location (Colombo, Sri Lanka)
DEFAULT_HOME_LAT = 6.9271
DEFAULT_HOME_LON = 79.8612
DEFAULT_HOME_ALT = 0

# Mission Parameters
GRID_SEARCH_ALTITUDE = 30  # meters
GRID_SPACING = 50  # meters between waypoints
GRID_SIZE = 500  # meters (search area 500x500)

# Vision Parameters
TARGET_MARKER_COLOR = "red"  # Color to detect (e.g., red marker for survivor)
MIN_MARKER_AREA = 100  # minimum pixel area to consider a valid detection
VISION_CONFIDENCE_THRESHOLD = 0.7

# WebSocket Configuration
WS_PORT = 8765
WS_HOST = "0.0.0.0"

# API Configuration
API_HOST = "0.0.0.0"
API_PORT = 8000
RELOAD = os.getenv("ENV", "development") == "development"
