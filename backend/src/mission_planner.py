"""
Mission planner for autonomous grid search
"""
import math
from typing import List, Tuple
import config

class MissionPlanner:
    def __init__(self):
        self.waypoints: List[Tuple[float, float, float]] = []
        self.current_waypoint_index = 0
        
    def generate_grid_search(
        self,
        center_lat: float,
        center_lon: float,
        grid_size: float = config.GRID_SIZE,
        spacing: float = config.GRID_SPACING,
        altitude: float = config.GRID_SEARCH_ALTITUDE
    ) -> List[Tuple[float, float, float]]:
        """
        Generate a grid search pattern around a center point.
        Returns list of (lat, lon, alt) waypoints
        """
        waypoints = []
        
        # Convert grid size from meters to degrees (rough approximation)
        # 1 degree latitude ≈ 111 km, 1 degree longitude ≈ 111 km * cos(lat)
        lat_offset = grid_size / 111000  # meters to degrees
        lon_offset = grid_size / (111000 * math.cos(math.radians(center_lat)))
        
        # Convert spacing from meters to degrees
        spacing_lat = spacing / 111000
        spacing_lon = spacing / (111000 * math.cos(math.radians(center_lat)))
        
        # Generate grid
        start_lat = center_lat - (lat_offset / 2)
        start_lon = center_lon - (lon_offset / 2)
        
        current_lat = start_lat
        row = 0
        
        while current_lat <= start_lat + lat_offset:
            current_lon = start_lon
            
            # Alternate direction for each row (lawn-mower pattern)
            if row % 2 == 0:
                # Left to right
                while current_lon <= start_lon + lon_offset:
                    waypoints.append((current_lat, current_lon, altitude))
                    current_lon += spacing_lon
            else:
                # Right to left
                current_lon = start_lon + lon_offset
                while current_lon >= start_lon:
                    waypoints.append((current_lat, current_lon, altitude))
                    current_lon -= spacing_lon
            
            current_lat += spacing_lat
            row += 1
        
        self.waypoints = waypoints
        print(f"[MissionPlanner] Generated {len(waypoints)} grid waypoints")
        return waypoints
    
    def get_next_waypoint(self) -> Tuple[float, float, float] or None:
        """Get next waypoint in mission"""
        if self.current_waypoint_index < len(self.waypoints):
            wp = self.waypoints[self.current_waypoint_index]
            self.current_waypoint_index += 1
            return wp
        return None
    
    def reset_mission(self):
        """Reset mission to start"""
        self.current_waypoint_index = 0
    
    def get_mission_progress(self) -> dict:
        """Get current mission progress"""
        return {
            "total_waypoints": len(self.waypoints),
            "completed_waypoints": self.current_waypoint_index,
            "progress_percent": (self.current_waypoint_index / len(self.waypoints) * 100) 
                               if self.waypoints else 0,
        }
