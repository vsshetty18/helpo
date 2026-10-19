import { LocationCoordinate } from './vehicle';
import { Vector3D } from './telemetry';

export type IncidentSeverity = 'low' | 'moderate' | 'high' | 'critical';
export type IncidentReviewStatus = 'awaiting_review' | 'confirmed' | 'dismissed';

export interface SensorEvidence {
  impactForceG: number;
  rolloverDetected: boolean;
  speedDropKmh: number;
  airbagDeploymentStatus: boolean;
  axisAcceleration: Vector3D;
  peakDecelerationTimeMs: number;
}

export interface TimelineEvent {
  time: string;
  event: string;
  status: 'info' | 'warning' | 'critical' | 'success';
}

export interface AccidentIncident {
  id: string;
  vehicleId: string;
  vehicleRegistration: string;
  timestamp: string;
  location: LocationCoordinate;
  severity: IncidentSeverity;
  predictionScore: number; // 0.00 to 1.00
  reviewStatus: IncidentReviewStatus;
  sensorEvidence: SensorEvidence;
  timeline: TimelineEvent[];
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  resolvedAt?: string;
}

export interface EmergencyFacility {
  id: string;
  name: string;
  type: 'hospital' | 'police' | 'fire_station';
  address: string;
  phone: string;
  distanceKm: number;
  etaMinutes: number;
  lat: number;
  lng: number;
  status: 'Available' | 'Dispatched' | 'Standby';
}
