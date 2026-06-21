const API_BASE = 'http://localhost:8000/api';

export const apiClient = {
  async health() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async connectDrone() {
    const res = await fetch(`${API_BASE}/drone/connect`, { method: 'POST' });
    return res.json();
  },

  async armAndTakeoff(altitude: number = 30) {
    const res = await fetch(`${API_BASE}/drone/arm-takeoff?altitude=${altitude}`, { method: 'POST' });
    return res.json();
  },

  async rtl() {
    const res = await fetch(`${API_BASE}/drone/rtl`, { method: 'POST' });
    return res.json();
  },

  async land() {
    const res = await fetch(`${API_BASE}/drone/land`, { method: 'POST' });
    return res.json();
  },

  async disarm() {
    const res = await fetch(`${API_BASE}/drone/disarm`, { method: 'POST' });
    return res.json();
  },

  async getTelemetry() {
    const res = await fetch(`${API_BASE}/telemetry`);
    return res.json();
  },

  async generateGridMission(
    centerLat: number,
    centerLon: number,
    gridSize: number = 500,
    spacing: number = 50,
    altitude: number = 30
  ) {
    const res = await fetch(
      `${API_BASE}/mission/generate-grid?center_lat=${centerLat}&center_lon=${centerLon}&grid_size=${gridSize}&spacing=${spacing}&altitude=${altitude}`,
      { method: 'POST' }
    );
    return res.json();
  },

  async getMissionProgress() {
    const res = await fetch(`${API_BASE}/mission/progress`);
    return res.json();
  },

  async startMission() {
    const res = await fetch(`${API_BASE}/mission/start`, { method: 'POST' });
    return res.json();
  },

  async stopMission() {
    const res = await fetch(`${API_BASE}/mission/stop`, { method: 'POST' });
    return res.json();
  },

  async getDetections() {
    const res = await fetch(`${API_BASE}/detections`);
    return res.json();
  },
};
