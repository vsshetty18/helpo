import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Car,
  MapPin,
  Cpu,
  PhoneCall,
  Activity,
  Zap,
  ArrowLeft,
  ShieldAlert,
  Battery,
  Compass,
  Clock,
  Radio
} from 'lucide-react';
import { useDataStore } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { VehicleMap } from '../components/maps/VehicleMap';
import { SensorLineChart } from '../components/charts/SensorLineChart';
import { formatDate, formatRelativeTime, formatCoordinates } from '../utils/formatters';

export const VehicleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vehicles, getVehicleTelemetry, triggerSimulatedAccident, setSelectedVehicleId } = useDataStore();
  const { warning } = useToast();

  const vehicle = vehicles.find(v => v.id === id);

  if (!vehicle) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
        <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Vehicle Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested vehicle record does not exist or was deregistered.</p>
        <Link
          to="/vehicles"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#3478F6] text-white text-xs font-semibold rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Fleet
        </Link>
      </div>
    );
  }

  const telemetry = getVehicleTelemetry(vehicle.id);
  const latestTelemetry = telemetry[telemetry.length - 1];

  const handleTriggerCrash = () => {
    const inc = triggerSimulatedAccident(vehicle.id);
    if (inc) {
      warning(
        `Crash Simulated on ${vehicle.registrationNumber}`,
        `Telemetry G-force spiked to 9.2G. Review on Accident Detection page.`
      );
    }
  };

  const handleTrackLive = () => {
    setSelectedVehicleId(vehicle.id);
    navigate('/tracking');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${vehicle.registrationNumber}`}
        description={`${vehicle.make} ${vehicle.model} (${vehicle.year}) • ${vehicle.vehicleType}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Vehicles', href: '/vehicles' },
          { label: vehicle.registrationNumber }
        ]}
        actions={
          <>
            <button
              onClick={handleTrackLive}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#3478F6]" />
              <span>Track on Live Map</span>
            </button>
            <Link
              to={`/sensors?vehicleId=${vehicle.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sensor Monitor</span>
            </Link>
            <button
              onClick={handleTriggerCrash}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Simulate Crash</span>
            </button>
          </>
        }
      />

      {/* Top Details Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Operational Status
          </span>
          <div className="flex items-center justify-between">
            <StatusBadge status={vehicle.status} type="vehicle" />
            <StatusBadge status={vehicle.connectionStatus} type="connection" />
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Last ping: {formatRelativeTime(vehicle.lastUpdated)}
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Current Speed
          </span>
          <div className="text-2xl font-bold text-[#14243A]">{vehicle.speed} km/h</div>
          <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Compass className="w-3 h-3 text-slate-400" /> Heading: {vehicle.heading}°
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Telemetry G-Force
          </span>
          <div className="text-2xl font-bold text-[#14243A]">
            {latestTelemetry ? `${latestTelemetry.acceleration.z} G` : '1.02 G'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Tri-axial accelerometer active
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Power / Battery
          </span>
          <div className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
            <Battery className="w-5 h-5 text-emerald-600" />
            <span>{vehicle.fuelOrBatteryPercent ?? 88}%</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Onboard power bus nominal
          </span>
        </div>
      </div>

      {/* Main Grid: Location Map + Vehicle & Emergency Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-[#172033]">Live Vehicle Geolocation</h2>
              <p className="text-xs text-slate-500">
                {vehicle.currentLocation.address} ({formatCoordinates(vehicle.currentLocation.lat, vehicle.currentLocation.lng)})
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600 font-mono">
              GPS Fixed
            </span>
          </div>

          <div className="rounded-lg overflow-hidden border border-slate-100">
            <VehicleMap
              vehicles={[vehicle]}
              selectedVehicle={vehicle}
              height="360px"
              showFacilities={true}
            />
          </div>
        </div>

        {/* Specifications & Emergency Card */}
        <div className="space-y-6">
          {/* Owner & Emergency Contact */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <PhoneCall className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-[#172033]">Emergency Kin Contact</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Contact Name</span>
                <span className="font-semibold text-slate-800">{vehicle.emergencyContact.name}</span>
                <span className="text-slate-500 ml-1.5">({vehicle.emergencyContact.relationship})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Primary Phone</span>
                <span className="font-mono text-slate-800 font-medium">{vehicle.emergencyContact.phone}</span>
              </div>
              {vehicle.emergencyContact.secondaryPhone && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Secondary Phone</span>
                  <span className="font-mono text-slate-800">{vehicle.emergencyContact.secondaryPhone}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Authorized for automated 112 dispatch</span>
              </div>
            </div>
          </div>

          {/* Sensor Hardware Bindings */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <Cpu className="w-4 h-4 text-[#3478F6]" />
              <h3 className="text-sm font-bold text-[#172033]">Sensor Node Profile</h3>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-sans">IoT Controller:</span>
                <span className="font-semibold text-slate-800">{vehicle.sensorConfig.iotDeviceId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-sans">GPS Receiver:</span>
                <span className="text-slate-800">{vehicle.sensorConfig.gpsDeviceId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-sans">Motion IMU:</span>
                <span className="text-slate-800">{vehicle.sensorConfig.motionSensorId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-sans">Piezo Impact:</span>
                <span className="text-slate-800">{vehicle.sensorConfig.pressureSensorId}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-sans">Data Source:</span>
                <span className="capitalize text-[#3478F6] font-semibold">{vehicle.sensorConfig.dataSource}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Stream Chart Preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#172033]">Onboard Acceleration History (3-Axis G-Force)</h3>
            <p className="text-xs text-slate-500">Live sliding window of latest telemetry packets</p>
          </div>
          <Link
            to={`/sensors?vehicleId=${vehicle.id}`}
            className="text-xs text-[#3478F6] hover:underline font-semibold"
          >
            Full Telemetry Dashboard &rarr;
          </Link>
        </div>
        <SensorLineChart data={telemetry} height={200} type="acceleration" />
      </div>
    </div>
  );
};
