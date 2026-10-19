import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Car,
  Wifi,
  AlertTriangle,
  Siren,
  Plus,
  Map,
  ArrowRight,
  ShieldAlert,
  Radio,
  ExternalLink
} from 'lucide-react';
import { useDataStore } from '../context/DataContext';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { VehicleMap } from '../components/maps/VehicleMap';
import { formatRelativeTime } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const { vehicles, incidents, notifications, selectedVehicleId, setSelectedVehicleId } = useDataStore();
  const navigate = useNavigate();

  // Derived metrics from shared store
  const totalVehicles = vehicles.length;
  const onlineVehicles = vehicles.filter(v => v.connectionStatus === 'online').length;
  const accidentsDetected = incidents.length;
  const pendingIncidents = incidents.filter(i => i.reviewStatus === 'awaiting_review').length;
  const activeAlerts = notifications.filter(n => n.status !== 'Delivered' && n.status !== 'Acknowledged').length;

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#172033] tracking-tight">Fleet Operations Command</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-[#3478F6] border border-blue-200">
              Live Demo
            </span>
          </div>
          <p className="text-xs text-[#697586] mt-0.5">
            Real-time simulated telemetry, machine learning collision detection, and automated emergency coordination.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/vehicles/new"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#3478F6] hover:bg-blue-600 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </Link>
          <Link
            to="/tracking"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Map className="w-3.5 h-3.5 text-slate-500" />
            <span>Live Map</span>
          </Link>
          <Link
            to="/accidents"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Review Incidents ({pendingIncidents})</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Registered Vehicles"
          value={totalVehicles}
          subtitle="Connected to VehicleGuard IoT Hub"
          icon={<Car className="w-5 h-5" />}
          trend={totalVehicles > 0 ? { value: `+${totalVehicles} this session`, isPositive: true } : { value: '0 Registered', isNeutral: true }}
          onClick={() => navigate('/vehicles')}
        />
        <MetricCard
          title="Vehicles Online"
          value={`${onlineVehicles} / ${totalVehicles}`}
          subtitle={`${totalVehicles > 0 ? Math.round((onlineVehicles / totalVehicles) * 100) : 0}% telemetry stream active`}
          icon={<Wifi className="w-5 h-5 text-emerald-600" />}
          variant={onlineVehicles > 0 ? 'success' : 'default'}
          trend={onlineVehicles > 0 ? { value: `${onlineVehicles} Streaming`, isPositive: true } : { value: '0 Streaming', isNeutral: true }}
          onClick={() => navigate('/tracking')}
        />
        <MetricCard
          title="Accidents Detected"
          value={accidentsDetected}
          subtitle={`${pendingIncidents} awaiting safety officer review`}
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          variant={pendingIncidents > 0 ? 'danger' : 'default'}
          trend={pendingIncidents > 0 ? { value: `${pendingIncidents} Pending`, isPositive: false } : { value: '0 Pending', isPositive: true }}
          onClick={() => navigate('/accidents')}
        />
        <MetricCard
          title="Emergency Alerts Active"
          value={notifications.length}
          subtitle={`${activeAlerts} alerts in dispatch pipeline`}
          icon={<Siren className="w-5 h-5 text-[#3478F6]" />}
          variant="accent"
          onClick={() => navigate('/emergency')}
        />
      </div>

      {/* Main Grid: Interactive Map Preview + Urgent Alerts Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Preview Section */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-[#172033] flex items-center gap-2">
                <span>Bengaluru Fleet Geofence</span>
                <span className="text-[10px] text-slate-500 font-normal">(OpenStreetMap Tiles)</span>
              </h2>
              <p className="text-xs text-[#697586]">Click any vehicle marker to view details and telemetry</p>
            </div>
            <Link
              to="/tracking"
              className="text-xs text-[#3478F6] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Full Screen Tracking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 min-h-[340px] rounded-lg overflow-hidden border border-slate-100">
            <VehicleMap
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              onSelectVehicle={(veh) => setSelectedVehicleId(veh.id)}
              height="340px"
              showFacilities={true}
            />
          </div>

          {/* Quick telemetry bar beneath map */}
          {selectedVehicle && (
            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex flex-wrap items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#14243A]">{selectedVehicle.registrationNumber}</span>
                <span className="text-slate-500">{selectedVehicle.make} {selectedVehicle.model}</span>
                <StatusBadge status={selectedVehicle.status} type="vehicle" />
              </div>
              <div className="flex items-center gap-4 text-slate-600">
                <span>Speed: <strong className="text-slate-800">{selectedVehicle.speed} km/h</strong></span>
                <span>Location: <strong className="text-slate-800 truncate max-w-[200px] inline-block align-bottom">{selectedVehicle.currentLocation.address}</strong></span>
                <Link
                  to={`/sensors?vehicleId=${selectedVehicle.id}`}
                  className="text-[#3478F6] hover:underline font-semibold flex items-center gap-1"
                >
                  Inspect Sensors <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Recent Accident Alerts Sidebar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-[#172033]">Recent Accident Alerts</h2>
              <span className="text-[11px] text-slate-500">AI sensor anomaly detections</span>
            </div>
            <Link to="/accidents" className="text-xs text-[#3478F6] hover:underline font-semibold">
              View All
            </Link>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] pr-1">
            {incidents.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-400 text-xs">
                <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <span className="font-semibold text-slate-600 block">0 Incident Alerts</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">No crash anomalies detected across fleet nodes.</span>
              </div>
            ) : (
              incidents.slice(0, 4).map(incident => (
                <div
                  key={incident.id}
                  className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/50 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#14243A]">{incident.vehicleRegistration}</span>
                      <StatusBadge status={incident.severity} type="severity" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatRelativeTime(incident.timestamp)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                    {incident.location.address}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span>Impact: <strong className="text-slate-800">{incident.sensorEvidence.impactForceG}G</strong></span>
                      <span>AI Conf: <strong className="text-slate-800">{Math.round(incident.predictionScore * 100)}%</strong></span>
                    </div>
                    <StatusBadge status={incident.reviewStatus} type="incident" />
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            to="/emergency"
            className="mt-3 block text-center py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
          >
            Emergency Response Coordinator &rarr;
          </Link>
        </div>
      </div>

      {/* Bottom Section: Active Vehicles Table + Sensor Connectivity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Vehicles Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#172033]">Active Fleet Vehicles</h2>
              <p className="text-xs text-[#697586]">Real-time operational status and speed</p>
            </div>
            <Link to="/vehicles" className="text-xs text-[#3478F6] hover:underline font-semibold">
              Manage Fleet
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Speed</th>
                  <th className="py-2.5 px-3">IoT Node</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      0 vehicles registered. Click "Add Vehicle" to register a fleet node.
                    </td>
                  </tr>
                ) : (
                  vehicles.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#14243A]">{v.registrationNumber}</div>
                        <div className="text-[11px] text-slate-500">{v.make} {v.model}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-[180px] truncate">
                        {v.currentLocation.address}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {v.speed} km/h
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {v.sensorConfig.iotDeviceId}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={v.status} type="vehicle" />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/vehicles/${v.id}`}
                          className="text-[#3478F6] hover:underline font-medium"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sensor & Emergency Pipeline Health */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#172033] mb-1">Sensor Hub Connectivity</h2>
            <p className="text-xs text-[#697586] mb-4">Hardware node telemetry health</p>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-500" /> GPS Constellation Lock
                  </span>
                  <span className="text-slate-900 font-semibold">100% (5/5 Fixed)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full w-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#3478F6]" /> IMU Motion Telemetry Rate
                  </span>
                  <span className="text-slate-900 font-semibold">10 Hz (Normal)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-[#3478F6] h-1.5 rounded-full w-4/5"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-amber-500" /> Piezo Crash Sensors
                  </span>
                  <span className="text-slate-900 font-semibold">Calibrated (&lt;0.05 G drift)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-amber-500 h-1.5 rounded-full w-11/12"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-500" /> Emergency CAD Gateway
                  </span>
                  <span className="text-emerald-700 font-semibold">Ready (112 Connected)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full w-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-600 flex items-center justify-between">
              <span>Simulation Clock:</span>
              <span className="font-mono font-semibold text-slate-800">3000ms Poll Tick</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
