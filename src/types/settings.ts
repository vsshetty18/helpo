export interface SystemSettings {
  adminName: string;
  adminEmail: string;
  role: string;
  simulationIntervalMs: number;
  simulationActive: boolean;
  smsAlertsEnabled: boolean;
  policeCadAutoDispatch: boolean;
  hospitalDirectDispatch: boolean;
  highSeverityImpactThresholdG: number;
  speedDropThresholdKmh: number;
  mlConfidenceThreshold: number; // e.g. 0.75
  mapDefaultZoom: number;
  mapDefaultCenter: {
    lat: number;
    lng: number;
  };
  apiBaseUrl: string;
  useMockServices: boolean;
}
