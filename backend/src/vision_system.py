"""
Computer vision for marker/survivor detection using OpenCV
"""
import cv2
import numpy as np
from typing import List, Tuple, Optional
import config

class VisionSystem:
    def __init__(self):
        self.frame = None
        self.last_detections = []
        self.detection_history = []
        
    def detect_red_marker(self, frame: np.ndarray) -> List[dict]:
        """
        Detect red colored objects (markers/survivors) in frame
        Returns list of detections: [{"center": (x, y), "area": area, "confidence": conf}, ...]
        """
        if frame is None:
            return []
        
        try:
            # Convert BGR to HSV for better color detection
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            
            # Define red color range (red wraps around in HSV, so we need two ranges)
            lower_red1 = np.array([0, 120, 70])
            upper_red1 = np.array([10, 255, 255])
            
            lower_red2 = np.array([170, 120, 70])
            upper_red2 = np.array([180, 255, 255])
            
            # Create masks
            mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
            mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
            
            # Combine masks
            mask = cv2.bitwise_or(mask1, mask2)
            
            # Apply morphological operations to clean up
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
            
            # Find contours
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            detections = []
            for contour in contours:
                area = cv2.contourArea(contour)
                
                # Filter by minimum area
                if area < config.MIN_MARKER_AREA:
                    continue
                
                # Get bounding circle
                (x, y), radius = cv2.minEnclosingCircle(contour)
                
                # Calculate confidence based on how circular the object is
                contour_area = cv2.contourArea(contour)
                circle_area = np.pi * (radius ** 2)
                confidence = min(1.0, contour_area / circle_area) if circle_area > 0 else 0
                
                if confidence >= config.VISION_CONFIDENCE_THRESHOLD:
                    detections.append({
                        "center": (int(x), int(y)),
                        "radius": int(radius),
                        "area": area,
                        "confidence": confidence,
                        "contour": contour
                    })
            
            self.last_detections = detections
            return detections
            
        except Exception as e:
            print(f"[Vision] Detection error: {e}")
            return []
    
    def draw_detections(self, frame: np.ndarray, detections: List[dict]) -> np.ndarray:
        """Draw detection circles and info on frame"""
        output = frame.copy()
        
        for detection in detections:
            center = detection["center"]
            radius = detection["radius"]
            confidence = detection["confidence"]
            
            # Draw circle
            cv2.circle(output, center, radius, (0, 255, 0), 2)
            
            # Draw confidence text
            text = f"Conf: {confidence:.2f}"
            cv2.putText(
                output, text, (center[0] - 30, center[1] - radius - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2
            )
        
        return output
    
    def simulate_camera_feed(self, frame_number: int) -> np.ndarray:
        """
        Simulate a camera feed for testing without actual hardware.
        This creates synthetic frames with random red markers.
        """
        # Create a frame (640x480)
        frame = np.ones((480, 640, 3), dtype=np.uint8) * 200  # Light gray background
        
        # Add some texture
        noise = np.random.randint(0, 20, (480, 640, 3), dtype=np.uint8)
        frame = cv2.add(frame, noise)
        
        # Simulate a red marker appearing at frame 20+
        if frame_number >= 20:
            # Marker position moves slightly over time
            x = 320 + int(50 * np.sin(frame_number / 10))
            y = 240 + int(30 * np.cos(frame_number / 15))
            
            # Draw red circle (marker)
            cv2.circle(frame, (x, y), 30, (0, 0, 255), -1)
            
            # Add some variation
            for _ in range(3):
                dx = np.random.randint(-20, 20)
                dy = np.random.randint(-20, 20)
                cv2.circle(frame, (x + dx, y + dy), 10, (0, 0, 200), -1)
        
        # Add grid lines for reference
        for i in range(0, 640, 80):
            cv2.line(frame, (i, 0), (i, 480), (100, 100, 100), 1)
        for i in range(0, 480, 80):
            cv2.line(frame, (0, i), (640, i), (100, 100, 100), 1)
        
        # Add frame number
        cv2.putText(frame, f"Frame: {frame_number}", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
        
        return frame
    
    def store_detection(self, lat: float, lon: float, confidence: float):
        """Store detection in history"""
        self.detection_history.append({
            "latitude": lat,
            "longitude": lon,
            "confidence": confidence,
            "timestamp": len(self.detection_history)
        })
