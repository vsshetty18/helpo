import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Vehicle } from '../../types/vehicle';
import { EmergencyFacility } from '../../types/incident';

interface VehicleMapProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  facilities?: EmergencyFacility[];
  height?: string;
  showFacilities?: boolean;
  routeCoordinates?: [number, number][];
}

// Custom SVG marker generators
const createVehicleIcon = (v: Vehicle, isSelected: boolean) => {
  let color = '#3478F6'; // stationary
  let pulse = '';

  if (v.status === 'moving') {
    color = '#10B981'; // emerald
  } else if (v.status === 'incident') {
    color = '#EF4444'; // critical red
    pulse = '<div class="absolute -inset-2 rounded-full bg-rose-500/30 animate-ping"></div>';
  } else if (v.status === 'offline') {
    color = '#64748B'; // gray
  }

  const border = isSelected ? 'border-2 border-white ring-3 ring-blue-500 shadow-xl scale-110' : 'border-2 border-white shadow-md';
  const rotation = v.heading || 0;

  const html = `
    <div class="relative flex items-center justify-center transition-transform duration-300">
      ${pulse}
      <div class="w-8 h-8 rounded-full flex items-center justify-center text-white ${border}" style="background-color: ${color};">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(${rotation}deg);">
          <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-vehicle-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

const createFacilityIcon = (type: 'hospital' | 'police' | 'fire_station') => {
  let color = '#E11D48'; // hospital
  let symbol = 'H';
  if (type === 'police') {
    color = '#1E40AF';
    symbol = 'P';
  } else if (type === 'fire_station') {
    color = '#D97706';
    symbol = 'F';
  }

  const html = `
    <div class="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md border border-white" style="background-color: ${color};">
      ${symbol}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-facility-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

export const VehicleMap: React.FC<VehicleMapProps> = ({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  facilities = [],
  height = '100%',
  showFacilities = true,
  routeCoordinates
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vehicleMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const facilityMarkersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default to Bengaluru central
      const initialLat = selectedVehicle?.currentLocation.lat || 12.9716;
      const initialLng = selectedVehicle?.currentLocation.lng || 77.5946;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 12,
        zoomControl: true,
        attributionControl: true
      });

      // OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Simulated Telemetry'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update vehicle markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentMarkers = vehicleMarkersRef.current;
    const currentVehicleIds = new Set(vehicles.map(v => v.id));

    // Remove markers for vehicles no longer present
    currentMarkers.forEach((marker, id) => {
      if (!currentVehicleIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    });

    // Add or update markers
    vehicles.forEach(vehicle => {
      const isSelected = selectedVehicle?.id === vehicle.id;
      const icon = createVehicleIcon(vehicle, isSelected);
      const latLng: [number, number] = [vehicle.currentLocation.lat, vehicle.currentLocation.lng];

      if (currentMarkers.has(vehicle.id)) {
        const marker = currentMarkers.get(vehicle.id)!;
        marker.setLatLng(latLng);
        marker.setIcon(icon);
      } else {
        const marker = L.marker(latLng, { icon }).addTo(map);
        marker.on('click', () => {
          if (onSelectVehicle) {
            onSelectVehicle(vehicle);
          }
        });
        currentMarkers.set(vehicle.id, marker);
      }

      // Bind popup
      const marker = currentMarkers.get(vehicle.id);
      if (marker) {
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 160px;">
            <div style="font-weight: 700; color: #14243A; font-size: 13px;">${vehicle.registrationNumber}</div>
            <div style="color: #697586;">${vehicle.make} ${vehicle.model}</div>
            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
              <span style="color: #697586;">Speed:</span>
              <strong style="color: #172033;">${vehicle.speed} km/h</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #697586;">Status:</span>
              <span style="text-transform: capitalize; font-weight: 600; color: ${
                vehicle.status === 'incident' ? '#ef4444' : vehicle.status === 'moving' ? '#10b981' : '#3478f6'
              };">${vehicle.status}</span>
            </div>
          </div>
        `);
      }
    });
  }, [vehicles, selectedVehicle, onSelectVehicle]);

  // Update facilities markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old facilities
    facilityMarkersRef.current.forEach(m => m.remove());
    facilityMarkersRef.current = [];

    if (!showFacilities) return;

    facilities.forEach(fac => {
      const icon = createFacilityIcon(fac.type);
      const marker = L.marker([fac.lat, fac.lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
          <div style="font-weight: 700; color: #14243A;">${fac.name}</div>
          <div style="color: #697586; text-transform: capitalize;">${fac.type.replace('_', ' ')} • ${fac.distanceKm} km away</div>
          <div style="color: #697586; font-size: 11px; margin-top: 4px;">${fac.address}</div>
          <div style="color: #3478f6; font-weight: 600; margin-top: 4px;">Phone: ${fac.phone}</div>
        </div>
      `);
      facilityMarkersRef.current.push(marker);
    });
  }, [facilities, showFacilities]);

  // Update route polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (routeCoordinates && routeCoordinates.length > 1) {
      polylineRef.current = L.polyline(routeCoordinates, {
        color: '#3478F6',
        weight: 4,
        opacity: 0.75,
        dashArray: '6, 8'
      }).addTo(map);
    }
  }, [routeCoordinates]);

  // Fly/Pan to selected vehicle when changed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedVehicle) return;

    map.panTo([selectedVehicle.currentLocation.lat, selectedVehicle.currentLocation.lng], {
      animate: true,
      duration: 0.8
    });
  }, [selectedVehicle?.id]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 shadow-xs" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      
      {/* Legend overlay */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-xs px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-xs flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-slate-600">Moving</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span className="text-slate-600">Stationary</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span className="text-slate-600 font-medium">Incident</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
          <span className="text-slate-600">Offline</span>
        </div>
      </div>
    </div>
  );
};
