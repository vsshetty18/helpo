import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Vehicle } from '../types/vehicle';
import { AccidentIncident, EmergencyFacility, IncidentReviewStatus } from '../types/incident';
import { EmergencyNotification, NotificationChannel } from '../types/notification';
import { TelemetryReading } from '../types/telemetry';
import { SystemSettings } from '../types/settings';
import { INITIAL_VEHICLES } from '../data/mockVehicles';
import { INITIAL_INCIDENTS } from '../data/mockIncidents';
import { INITIAL_NOTIFICATIONS } from '../data/mockNotifications';
import { EMERGENCY_FACILITIES } from '../data/mockFacilities';
import { generateInitialTelemetryHistory } from '../data/mockTelemetry';

const STORAGE_KEYS = {
  VEHICLES: 'vg_ai_vehicles_v2_zero',
  INCIDENTS: 'vg_ai_incidents_v2_zero',
  NOTIFICATIONS: 'vg_ai_notifications_v2_zero',
  SETTINGS: 'vg_ai_settings_v2_zero',
};

// Clear any legacy storage with sample data
try {
  localStorage.removeItem('vg_ai_vehicles_v1');
  localStorage.removeItem('vg_ai_incidents_v1');
  localStorage.removeItem('vg_ai_notifications_v1');
  localStorage.removeItem('vg_ai_settings_v1');
} catch {
  // ignore
}

const DEFAULT_SETTINGS: SystemSettings = {
  adminName: 'Operations Commander (Admin)',
  adminEmail: 'ops.center@vehicleguard.ai',
  role: 'Chief Dispatcher',
  simulationIntervalMs: 3000,
  simulationActive: true,
  smsAlertsEnabled: true,
  policeCadAutoDispatch: true,
  hospitalDirectDispatch: true,
  highSeverityImpactThresholdG: 6.5,
  speedDropThresholdKmh: 35.0,
  mlConfidenceThreshold: 0.70,
  mapDefaultZoom: 12,
  mapDefaultCenter: {
    lat: 12.9716,
    lng: 77.5946
  },
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  useMockServices: true
};

interface DataContextType {
  vehicles: Vehicle[];
  incidents: AccidentIncident[];
  notifications: EmergencyNotification[];
  facilities: EmergencyFacility[];
  settings: SystemSettings;
  telemetryStreams: Record<string, TelemetryReading[]>;
  isSimulationRunning: boolean;
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
  toggleSimulation: (override?: boolean) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'lastUpdated'>) => { success: boolean; error?: string; vehicle?: Vehicle };
  updateVehicle: (id: string, updates: Partial<Vehicle>) => boolean;
  deleteVehicle: (id: string) => boolean;
  reviewIncident: (id: string, status: IncidentReviewStatus, notes?: string) => boolean;
  acknowledgeIncident: (id: string) => boolean;
  resolveIncident: (id: string) => boolean;
  triggerSimulatedAccident: (vehicleId: string) => AccidentIncident | null;
  sendEmergencyAlert: (incidentId: string, channel: NotificationChannel, recipientOverride?: { name: string; phone: string; role: string }) => EmergencyNotification | null;
  retryNotification: (id: string) => boolean;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetAllData: () => void;
  getVehicleTelemetry: (vehicleId: string) => TelemetryReading[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Safe load helper
  const loadFromStorage = <T,>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch (e) {
      console.warn(`Failed reading ${key} from storage:`, e);
    }
    return fallback;
  };

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => loadFromStorage(STORAGE_KEYS.VEHICLES, []));
  const [incidents, setIncidents] = useState<AccidentIncident[]>(() => loadFromStorage(STORAGE_KEYS.INCIDENTS, []));
  const [notifications, setNotifications] = useState<EmergencyNotification[]>(() => loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, []));
  const [settings, setSettings] = useState<SystemSettings>(() => loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS));
  const [facilities] = useState<EmergencyFacility[]>([]);
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // In-memory telemetry buffer keyed by vehicleId
  const [telemetryStreams, setTelemetryStreams] = useState<Record<string, TelemetryReading[]>>({});

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
    } catch (e) {
      console.error('Error saving vehicles to localStorage', e);
    }
  }, [vehicles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
    } catch (e) {
      console.error('Error saving incidents to localStorage', e);
    }
  }, [incidents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error('Error saving notifications to localStorage', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to localStorage', e);
    }
  }, [settings]);

  // Ref to hold current state to avoid closure staleness in simulation interval
  const vehiclesRef = useRef(vehicles);
  vehiclesRef.current = vehicles;

  // Real-time Simulation Engine
  useEffect(() => {
    if (!isSimulationRunning) return;

    const interval = setInterval(() => {
      setVehicles(prevVehicles => {
        return prevVehicles.map(veh => {
          if (veh.status !== 'moving' || veh.connectionStatus !== 'online') {
            return {
              ...veh,
              lastUpdated: new Date().toISOString()
            };
          }

          // Small heading-based delta in Bengaluru bounds
          const headingRad = (veh.heading * Math.PI) / 180;
          const speedFactor = (veh.speed / 3600) * 0.01; // simulated step
          const deltaLat = Math.cos(headingRad) * speedFactor;
          const deltaLng = Math.sin(headingRad) * speedFactor;

          // Minor speed jitter
          const speedJitter = (Math.random() * 4 - 2);
          const newSpeed = Math.max(20, Math.min(85, +(veh.speed + speedJitter).toFixed(1)));

          // Subtle heading curve
          const newHeading = (veh.heading + (Math.random() * 6 - 3) + 360) % 360;

          return {
            ...veh,
            speed: newSpeed,
            heading: Math.round(newHeading),
            lastUpdated: new Date().toISOString(),
            currentLocation: {
              ...veh.currentLocation,
              lat: +(veh.currentLocation.lat + deltaLat).toFixed(6),
              lng: +(veh.currentLocation.lng + deltaLng).toFixed(6)
            }
          };
        });
      });

      // Update telemetry for vehicles
      setTelemetryStreams(prevStreams => {
        const nextStreams = { ...prevStreams };
        vehiclesRef.current.forEach(veh => {
          const currentList = nextStreams[veh.id] || [];
          const nowStr = new Date().toISOString();
          
          let accelX = 0.05 + (Math.random() * 0.1 - 0.05);
          let accelY = 0.02 + (Math.random() * 0.06 - 0.03);
          let accelZ = 0.98 + (Math.random() * 0.04 - 0.02);
          let impactPressure = 12 + Math.random() * 2;
          let status: 'normal' | 'warning' | 'critical' = 'normal';

          if (veh.status === 'incident') {
            accelX = 5.4;
            accelY = -2.8;
            accelZ = 1.8;
            impactPressure = 92.4;
            status = 'critical';
          } else if (veh.speed > 75) {
            status = 'warning';
          }

          const newPoint: TelemetryReading = {
            id: `tel-${veh.id}-${Date.now()}`,
            vehicleId: veh.id,
            timestamp: nowStr,
            speed: veh.speed,
            acceleration: {
              x: +accelX.toFixed(2),
              y: +accelY.toFixed(2),
              z: +accelZ.toFixed(2)
            },
            gyro: {
              x: +(Math.random() * 1.5 - 0.75).toFixed(2),
              y: +(Math.random() * 1.5 - 0.75).toFixed(2),
              z: +(Math.random() * 1.2 - 0.6).toFixed(2)
            },
            impactPressure: +impactPressure.toFixed(1),
            gps: {
              lat: veh.currentLocation.lat,
              lng: veh.currentLocation.lng,
              altitude: 920,
              accuracy: 2.1
            },
            temperature: 33 + Math.random() * 3,
            status,
            rollAngle: +(Math.random() * 2 - 1).toFixed(1),
            pitchAngle: +(Math.random() * 1.6 - 0.8).toFixed(1)
          };

          // Keep sliding window of latest 25 telemetry points
          const updated = [...currentList, newPoint];
          if (updated.length > 25) {
            updated.shift();
          }
          nextStreams[veh.id] = updated;
        });

        return nextStreams;
      });
    }, settings.simulationIntervalMs || 3000);

    return () => clearInterval(interval);
  }, [isSimulationRunning, settings.simulationIntervalMs]);

  // Actions
  const toggleSimulation = useCallback((override?: boolean) => {
    setIsSimulationRunning(prev => (typeof override === 'boolean' ? override : !prev));
  }, []);

  const addVehicle = useCallback((vehicleData: Omit<Vehicle, 'id' | 'lastUpdated'>) => {
    // Check duplicate registration
    const duplicate = vehicles.some(
      v => v.registrationNumber.trim().toUpperCase() === vehicleData.registrationNumber.trim().toUpperCase()
    );
    if (duplicate) {
      return { success: false, error: `Vehicle with registration '${vehicleData.registrationNumber}' already exists.` };
    }

    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `veh-${Date.now().toString(36)}`,
      lastUpdated: new Date().toISOString()
    };

    setVehicles(prev => [newVehicle, ...prev]);
    setTelemetryStreams(prev => ({
      ...prev,
      [newVehicle.id]: generateInitialTelemetryHistory(newVehicle.id, newVehicle.speed)
    }));

    return { success: true, vehicle: newVehicle };
  }, [vehicles]);

  const updateVehicle = useCallback((id: string, updates: Partial<Vehicle>) => {
    let found = false;
    setVehicles(prev =>
      prev.map(v => {
        if (v.id === id) {
          found = true;
          return { ...v, ...updates, lastUpdated: new Date().toISOString() };
        }
        return v;
      })
    );
    return found;
  }, []);

  const deleteVehicle = useCallback((id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
    if (selectedVehicleId === id) {
      setSelectedVehicleId(null);
    }
    return true;
  }, [selectedVehicleId]);

  const reviewIncident = useCallback((id: string, status: IncidentReviewStatus, notes?: string) => {
    let updated = false;
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id === id) {
          updated = true;
          return {
            ...inc,
            reviewStatus: status,
            reviewedAt: new Date().toISOString(),
            reviewedBy: settings.adminName,
            notes: notes ? `${inc.notes ? inc.notes + ' | ' : ''}${notes}` : inc.notes
          };
        }
        return inc;
      })
    );
    return updated;
  }, [settings.adminName]);

  const acknowledgeIncident = useCallback((id: string) => {
    const now = new Date().toISOString();
    setIncidents(prev =>
      prev.map(inc => (inc.id === id ? { ...inc, reviewedAt: now, reviewedBy: settings.adminName } : inc))
    );
    setNotifications(prev =>
      prev.map(notif => (notif.incidentId === id ? { ...notif, status: 'Acknowledged', acknowledgedAt: now } : notif))
    );
    return true;
  }, [settings.adminName]);

  const resolveIncident = useCallback((id: string) => {
    const now = new Date().toISOString();
    const inc = incidents.find(i => i.id === id);
    if (inc) {
      // Set vehicle status back to stationary
      updateVehicle(inc.vehicleId, { status: 'stationary' });
    }
    setIncidents(prev =>
      prev.map(i => (i.id === id ? { ...i, reviewStatus: 'confirmed', resolvedAt: now } : i))
    );
    return true;
  }, [incidents, updateVehicle]);

  // Demo accident trigger on a chosen vehicle
  const triggerSimulatedAccident = useCallback((vehicleId: string): AccidentIncident | null => {
    const target = vehicles.find(v => v.id === vehicleId);
    if (!target) return null;

    const incidentId = `INC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newIncident: AccidentIncident = {
      id: incidentId,
      vehicleId: target.id,
      vehicleRegistration: target.registrationNumber,
      timestamp: now,
      location: { ...target.currentLocation },
      severity: 'critical',
      predictionScore: 0.96,
      reviewStatus: 'awaiting_review',
      sensorEvidence: {
        impactForceG: 9.2,
        rolloverDetected: false,
        speedDropKmh: +(target.speed > 20 ? target.speed : 52).toFixed(1),
        airbagDeploymentStatus: true,
        axisAcceleration: { x: 8.9, y: -4.5, z: 2.2 },
        peakDecelerationTimeMs: 110
      },
      timeline: [
        {
          time: 'Just now',
          event: `Simulated high-impact event triggered on ${target.registrationNumber}`,
          status: 'critical'
        },
        {
          time: 'Just now',
          event: 'Piezo pressure sensor exceeded critical threshold (9.2G)',
          status: 'critical'
        },
        {
          time: 'Just now',
          event: 'AI Confidence Score: 96.0% (Automated Incident Detected)',
          status: 'warning'
        }
      ],
      notes: `Live simulated collision triggered by operator. Target speed immediately brought to 0.`
    };

    // Update vehicle to incident state and 0 speed
    updateVehicle(target.id, {
      status: 'incident',
      speed: 0
    });

    // Add incident
    setIncidents(prev => [newIncident, ...prev]);

    // Automatically trigger simulated emergency notification alert
    const newNotif: EmergencyNotification = {
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      incidentId: newIncident.id,
      vehicleRegistration: target.registrationNumber,
      timestamp: now,
      recipient: target.emergencyContact.name,
      recipientRole: 'Primary Kin',
      phone: target.emergencyContact.phone,
      channel: 'SMS',
      status: 'Sent',
      messagePreview: `[VEHICLEGUARD AI DISPATCH] URGENT: Severe collision detected for vehicle ${target.registrationNumber} at ${target.currentLocation.address}. Coordinates: ${target.currentLocation.lat}, ${target.currentLocation.lng}.`,
      locationLink: `https://maps.google.com/?q=${target.currentLocation.lat},${target.currentLocation.lng}`,
      sentAt: now,
      retryCount: 0
    };

    setNotifications(prev => [newNotif, ...prev]);

    return newIncident;
  }, [vehicles, updateVehicle]);

  const sendEmergencyAlert = useCallback((
    incidentId: string,
    channel: NotificationChannel,
    recipientOverride?: { name: string; phone: string; role: string }
  ): EmergencyNotification | null => {
    const inc = incidents.find(i => i.id === incidentId);
    if (!inc) return null;

    const veh = vehicles.find(v => v.id === inc.vehicleId);
    const now = new Date().toISOString();

    const recipient = recipientOverride?.name || veh?.emergencyContact.name || 'Emergency Dispatch Unit';
    const phone = recipientOverride?.phone || veh?.emergencyContact.phone || '+91 80 2294 2565';
    const role = recipientOverride?.role || 'Emergency Contact';

    const newNotif: EmergencyNotification = {
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      incidentId,
      vehicleRegistration: inc.vehicleRegistration,
      timestamp: now,
      recipient,
      recipientRole: role,
      phone,
      channel,
      status: 'Sent',
      messagePreview: `[VEHICLEGUARD] Alert for ${inc.vehicleRegistration} at ${inc.location.address}. Severity: ${inc.severity.toUpperCase()}. Impact: ${inc.sensorEvidence.impactForceG}G. Live location: https://maps.google.com/?q=${inc.location.lat},${inc.location.lng}`,
      locationLink: `https://maps.google.com/?q=${inc.location.lat},${inc.location.lng}`,
      sentAt: now,
      retryCount: 0
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Simulate network delivery progression
    setTimeout(() => {
      setNotifications(prev =>
        prev.map(n => (n.id === newNotif.id ? { ...n, status: 'Delivered' } : n))
      );
    }, 1500);

    return newNotif;
  }, [incidents, vehicles]);

  const retryNotification = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notif => {
        if (notif.id === id) {
          return {
            ...notif,
            status: 'Delivered',
            sentAt: new Date().toISOString(),
            retryCount: notif.retryCount + 1
          };
        }
        return notif;
      })
    );
    return true;
  }, []);

  const updateSettings = useCallback((newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const resetAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.VEHICLES);
    localStorage.removeItem(STORAGE_KEYS.INCIDENTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);

    setVehicles([]);
    setIncidents([]);
    setNotifications([]);
    setSettings(DEFAULT_SETTINGS);
    setTelemetryStreams({});
    setSelectedVehicleId(null);
    setIsSimulationRunning(true);
  }, []);

  const getVehicleTelemetry = useCallback((vehicleId: string): TelemetryReading[] => {
    return telemetryStreams[vehicleId] || [];
  }, [telemetryStreams]);

  return (
    <DataContext.Provider
      value={{
        vehicles,
        incidents,
        notifications,
        facilities,
        settings,
        telemetryStreams,
        isSimulationRunning,
        selectedVehicleId,
        setSelectedVehicleId,
        toggleSimulation,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        reviewIncident,
        acknowledgeIncident,
        resolveIncident,
        triggerSimulatedAccident,
        sendEmergencyAlert,
        retryNotification,
        updateSettings,
        resetAllData,
        getVehicleTelemetry
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useDataStore = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataStore must be used within a DataProvider');
  }
  return context;
};
