export type VehicleStatus = 'moving' | 'stationary' | 'incident' | 'offline';
export type ConnectionStatus = 'online' | 'offline' | 'degraded';
export type VehicleType = 'SUV' | 'Sedan' | 'Truck' | 'Ambulance' | 'Bus' | 'Van' | 'Electric EV';

export interface LocationCoordinate {
  lat: number;
  lng: number;
  address: string;
}

export interface SensorConfig {
  gpsDeviceId: string;
  motionSensorId: string;
  pressureSensorId: string;
  iotDeviceId: string;
  dataSource: 'simulator' | 'physical';
}

export interface EmergencyContact {
  name: string;
  phone: string;
  secondaryPhone?: string;
  relationship?: string;
  consentGiven: boolean;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  vehicleType: VehicleType;
  ownerName: string;
  ownerPhone: string;
  status: VehicleStatus;
  connectionStatus: ConnectionStatus;
  currentLocation: LocationCoordinate;
  speed: number; // in km/h
  heading: number; // in degrees 0-360
  lastUpdated: string; // ISO string
  sensorConfig: SensorConfig;
  emergencyContact: EmergencyContact;
  color?: string;
  fuelOrBatteryPercent?: number;
}
