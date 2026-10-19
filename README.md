# VehicleGuard AI — Intelligent Fleet Safety & Emergency Response

VehicleGuard AI is a state-of-the-art AI-based vehicle tracking, accident detection, and emergency response coordination web platform designed for major fleet safety operations.

---

## Key Features

1. **Fleet Operations Command Dashboard (`/dashboard`)**:
   - Live KPI cards: Total Registered Vehicles, Vehicles Online, Accidents Detected, and Pending Emergency Alerts.
   - Interactive OpenStreetMap preview of fleet geofence around Bengaluru, Karnataka.
   - Live incident alert feed, active fleet speed table, and IoT sensor connectivity health overview.

2. **Add Vehicle & Sensors (`/vehicles/new`)**:
   - 3-section validated form: Vehicle Specifications, IoT & Sensor Hardware Configuration, and Emergency Kin Consent.
   - Prevents duplicate registration numbers.
   - Newly added vehicles immediately propagate across all maps, sensor dropdowns, and fleet tables.

3. **Vehicle Fleet Management (`/vehicles` & `/vehicles/:id`)**:
   - Searchable by registration, owner, make, or model.
   - Status filters: All, Moving, Stationary, Incident Alert, Online, and Offline.
   - Actions: Detailed profile, real-time map focus, sensor monitor, quick edit, and deregistration with safety confirmation dialogs.

4. **Live Geofence Tracking Map (`/tracking`)**:
   - Interactive OpenStreetMap with custom SVG markers with heading indicators and pulse animations.
   - Bangalore area coordinates (MG Road, Koramangala, Indiranagar, Electronic City, Whitefield, Hebbal, HAL).
   - Real-time simulation clock (3-second tick interval) with pause/resume controls.
   - Overlays for nearest hospitals (Trauma centers) and police stations (Dial 112).
   - Route trail polyline visualization.

5. **Sensor Telemetry Waveform Monitoring (`/sensors`)**:
   - Real-time tri-axial accelerometer streams (X Surge, Y Sway, Z Heave).
   - Speed vs Time, Impact Pressure (Piezo FSR in kPa), and MCU core thermal monitoring.
   - Raw packet buffer log table with millisecond timestamps.

6. **AI Accident Detection & Review (`/accidents`)**:
   - Anomaly detection for sudden deceleration spikes (-48 km/h in <150ms) and high-G structural impact.
   - AI confidence score (e.g. 94% - 96%).
   - Operator review workflow: Confirm Crash, Dismiss Event (with audit justification modal), or Mark Reviewed.

7. **Emergency CAD Coordination (`/emergency`)**:
   - Automated routing to Dial 112 Law & Traffic CAD gateway, nearest trauma centers, and primary kin.
   - Notification states: `Pending` &rarr; `Queued` &rarr; `Sent` &rarr; `Delivered` &rarr; `Acknowledged`.
   - Actions: Send Test Alert, Retry Transmission, Mark Acknowledged, and Resolve Incident.

8. **Accident History & Audit Reports (`/history`)**:
   - Multi-filter historical audit log.
   - Visual analytics: Severity distribution donut chart and weekly incident volume bar chart.
   - Real downloadable CSV export.

9. **System Settings (`/settings`)**:
   - Dispatcher profile, sensor thresholds (Impact G-Force, Speed drop, ML confidence cutoff).
   - FastAPI base URL configuration & mock adapter toggles.
   - Persistent `localStorage` data store with clean "Reset Demo Data" seed restoration.

10. **Demo Authentication (`/login`)**:
    - Pre-filled credentials: `admin@vehicleguard.ai` / `demo`.

---

## Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Routing**: React Router v7
- **Maps**: Leaflet + OpenStreetMap Cartographic Tiles
- **Visualizations**: Recharts
- **Icons**: Lucide React
- **Data Layer**: Central reactive context store with deterministic seed data and `localStorage` persistence

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
```

---

## Python FastAPI Backend Readiness

The frontend is architected for seamless connection to a Python FastAPI backend:
1. Environment variables configured in `.env.example`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_USE_MOCK_SERVICES=true
   VITE_SIMULATION_INTERVAL_MS=3000
   ```
2. Reusable client in `src/services/apiClient.ts` with timeout handling and error abstraction.
3. Clean service layer (`vehicleService.ts`, `incidentService.ts`, `telemetryService.ts`, `notificationService.ts`) ready to toggle from simulated mock state to live REST/WebSocket endpoints.
