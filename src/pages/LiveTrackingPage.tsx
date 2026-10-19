import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Play,
  Pause,
  Compass,
  Radio,
  ExternalLink,
  Zap,
  Activity,
  Layers,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { useDataStore } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { VehicleMap } from '../components/maps/VehicleMap';
import { StatusBadge } from '../components/common/StatusBadge';
import { PageHeader } from '../components/common/PageHeader';
import { formatRelativeTime, formatCoordinates } from '../utils/formatters';
import { Vehicle } from '../types/vehicle';
import { Link } from 'react-router-dom';

export const LiveTrackingPage: React.FC = () => {
  const {
    vehicles,
    selectedVehicleId,
    setSelectedVehicleId,
    isSimulationRunning,
    toggleSimulation,
    triggerSimulatedAccident,
    facilities,
    getVehicleTelemetry
  } = useDataStore();
  const { success, warning } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFacilities, setShowFacilities] = useState(true);
  const [showRouteTrail, setShowRouteTrail] = useState(true);

  // Selected vehicle
  const selectedVehicle = useMemo(() => {
    return vehicles.find(v => v.id === selectedVehicleId) || vehicles[0] || null;
  }, [vehicles, selectedVehicleId]);

  // Telemetry coordinates for selected vehicle to show route trail
  const routeCoordinates = useMemo<[number, number][]>(() => {
    if (!selectedVehicle || !showRouteTrail) return [];
    const telemetry = getVehicleTelemetry(selectedVehicle.id);
    return telemetry.map(t => [t.gps.lat, t.gps.lng]);
  }, [selectedVehicle, showRouteTrail, getVehicleTelemetry]);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchSearch =
        v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.ownerName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (filterStatus === 'all') return true;
      if (filterStatus === 'moving') return v.status === 'moving';
      if (filterStatus === 'stationary') return v.status === 'stationary';
      if (filterStatus === 'incident') return v.status === 'incident';
      return true;
    });
  }, [vehicles, searchQuery, filterStatus]);

  const handleSimToggle = () => {
    toggleSimulation();
    if (isSimulationRunning) {
      warning('Simulation Paused', 'Vehicle movement ticks are suspended.');
    } else {
      success('Simulation Active', 'Real-time GPS coordinate updates resuming.');
    }
  };

  const handleCrashOnSelected = () => {
    if (!selectedVehicle) return;
    const inc = triggerSimulatedAccident(selectedVehicle.id);
    if (inc) {
      warning(
        `High-G Impact Simulated on ${selectedVehicle.registrationNumber}`,
        `Marker shifted to Incident state. Alert transmitted to 112.`
      );
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-6.5rem)]">
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#172033] tracking-tight">Live Fleet Geofence Tracking</h1>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
              Bengaluru, Karnataka (Simulated GPS)
            </span>
          </div>
          <p className="text-xs text-[#697586]">
            Real-time coordinates streamed from onboard IoT nodes. OpenStreetMap cartographic tile layer.
          </p>
        </div>

        {/* Map Control Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFacilities(!showFacilities)}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              showFacilities
                ? 'bg-blue-50 text-[#3478F6] border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {showFacilities ? 'Hide Facilities' : 'Show Hospitals & Police'}
          </button>

          <button
            onClick={() => setShowRouteTrail(!showRouteTrail)}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              showRouteTrail
                ? 'bg-blue-50 text-[#3478F6] border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {showRouteTrail ? 'Hide Trail' : 'Show Route Trail'}
          </button>

          <button
            onClick={handleSimToggle}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isSimulationRunning
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            {isSimulationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulationRunning ? 'Simulation Running' : 'Resume Sim'}</span>
          </button>
        </div>
      </div>

      {/* Main Map + Side Panel Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Left Side Panel: Vehicle List & Search */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden order-2 lg:order-1 h-72 lg:h-full">
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-slate-100 space-y-2 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search fleet..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#3478F6]"
              />
            </div>

            <div className="flex items-center gap-1 text-[11px]">
              {['all', 'moving', 'stationary', 'incident'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2 py-1 rounded-md capitalize font-medium transition-colors cursor-pointer ${
                    filterStatus === st
                      ? 'bg-[#14243A] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredVehicles.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-400 text-xs">
                0 vehicles registered. Add a vehicle to begin tracking.
              </div>
            ) : (
              filteredVehicles.map(v => {
                const isSelected = selectedVehicle?.id === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={`p-3 transition-colors cursor-pointer text-xs ${
                      isSelected ? 'bg-blue-50/80 border-l-4 border-[#3478F6]' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-bold text-[#14243A]">{v.registrationNumber}</span>
                      <StatusBadge status={v.status} type="vehicle" />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {v.make} {v.model}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                      <span className="font-semibold">{v.speed} km/h</span>
                      <span className="text-slate-400">{formatRelativeTime(v.lastUpdated)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center shrink-0">
            {filteredVehicles.length} of {vehicles.length} vehicles displayed
          </div>
        </div>

        {/* Center & Right: Interactive Map View */}
        <div className="lg:col-span-3 flex flex-col gap-3 order-1 lg:order-2 h-96 lg:h-full">
          <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-200 shadow-xs">
            <VehicleMap
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              onSelectVehicle={v => setSelectedVehicleId(v.id)}
              facilities={facilities}
              showFacilities={showFacilities}
              routeCoordinates={routeCoordinates}
              height="100%"
            />
          </div>

          {/* Floating Selected Vehicle Card at bottom */}
          {selectedVehicle ? (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start md:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#14243A] font-bold shrink-0">
                  <MapPin className="w-5 h-5 text-[#3478F6]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#14243A]">{selectedVehicle.registrationNumber}</h3>
                    <span className="text-xs text-slate-500">{selectedVehicle.make} {selectedVehicle.model}</span>
                    <StatusBadge status={selectedVehicle.status} type="vehicle" />
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-xl truncate">
                    {selectedVehicle.currentLocation.address} ({formatCoordinates(selectedVehicle.currentLocation.lat, selectedVehicle.currentLocation.lng)})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <div className="flex items-center gap-4 text-xs pr-2 border-r border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Speed</span>
                    <strong className="text-slate-900">{selectedVehicle.speed} km/h</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Heading</span>
                    <strong className="text-slate-900">{selectedVehicle.heading}°</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Updated</span>
                    <strong className="text-slate-900">{formatRelativeTime(selectedVehicle.lastUpdated)}</strong>
                  </div>
                </div>

                <button
                  onClick={handleCrashOnSelected}
                  className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>Simulate Crash</span>
                </button>

                <Link
                  to={`/sensors?vehicleId=${selectedVehicle.id}`}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-[#3478F6]" />
                  <span>Sensors</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm shrink-0 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>0 vehicles in fleet. Register a vehicle to monitor live GPS coordinates.</span>
              </div>
              <Link
                to="/vehicles/new"
                className="px-3 py-1 text-xs font-semibold bg-[#3478F6] text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Vehicle
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
