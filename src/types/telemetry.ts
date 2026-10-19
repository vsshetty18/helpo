export type TelemetryStatus = 'normal' | 'warning' | 'critical';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface TelemetryReading {
  id: string;
  vehicleId: string;
  timestamp: string; // ISO string
  speed: number;
  acceleration: Vector3D; // in G forces (9.8 m/s^2)
  gyro: Vector3D; // in deg/s
  impactPressure: number; // in kPa or arbitrary impact force units
  gps: {
    lat: number;
    lng: number;
    altitude: number;
    accuracy: number;
  };
  temperature: number; // in deg C
  status: TelemetryStatus;
  rollAngle?: number;
  pitchAngle?: number;
}

export interface TelemetrySummary {
  vehicleId: string;
  currentSpeed: number;
  maxAccelerationG: number;
  latestStatus: TelemetryStatus;
  packetLossPercent: number;
  latencyMs: number;
  updatedAt: string;
}
