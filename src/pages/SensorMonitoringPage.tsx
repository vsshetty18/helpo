import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Play,
  Pause,
  Zap,
  Radio,
  Car,
  Activity,
  Plus
} from 'lucide-react';
import { useDataStore } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { SensorLineChart } from '../components/charts/SensorLineChart';

export const SensorMonitoringPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlVehicleId = searchParams.get('vehicleId');

  const {
    vehicles,
    selectedVehicleId,
    setSelectedVehicleId,
    getVehicleTelemetry,
    isSimulationRunning,
    toggleSimulation,
    triggerSimulatedAccident
  } = useDataStore();
  const { warning, success } = useToast();

  const [chartMode, setChartMode] = useState<'acceleration' | 'speed' | 'impact'>('acceleration');

  const activeVehicleId = urlVehicleId || selectedVehicleId || vehicles[0]?.id;
  const currentVehicle = vehicles.find(v => v.id === activeVehicleId) || vehicles[0] || null;

  const telemetry = currentVehicle ? getVehicleTelemetry(currentVehicle.id) : [];
  const latest = telemetry.length > 0 ? telemetry[telemetry.length - 1] : null;

  const handleSelectVehicle = (id: string) => {
    setSelectedVehicleId(id);
    setSearchParams({ vehicleId: id });
  };

  const handleSimToggle = () => {
    toggleSimulation();
    if (isSimulationRunning) {
      warning('Simulation Paused', 'Sensor stream feeds paused.');
    } else {
      success('Simulation Resumed', 'Streaming telemetry every 3s.');
    }
  };

  const handleSimulateCrash = () => {
    if (!currentVehicle) {
      warning('No Vehicle Available', 'Register a vehicle first to simulate telemetry spikes.');
      return;
    }
    const inc = triggerSimulatedAccident(currentVehicle.id);
    if (inc) {
      warning(
        `High-G Spike Injected on ${currentVehicle.registrationNumber}`,
        `Deceleration spike (9.2G) and front piezo impact logged to telemetry buffer.`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Vehicle Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#172033] tracking-tight">Sensor Telemetry Monitoring</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Stream
            </span>
          </div>
          <p className="text-xs text-[#697586] mt-0.5">
            Tri-axial accelerometer, gyroscope, piezo impact sensors, and GPS positioning stream.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-600">Select Vehicle:</span>
            {vehicles.length === 0 ? (
              <span className="text-xs font-semibold text-slate-400">0 Registered</span>
            ) : (
              <select
                value={currentVehicle?.id || ''}
                onChange={e => handleSelectVehicle(e.target.value)}
                className="text-xs font-bold text-[#14243A] bg-transparent focus:outline-hidden cursor-pointer"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber} ({v.make} {v.model})
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            onClick={handleSimToggle}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isSimulationRunning
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            {isSimulationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulationRunning ? 'Pause Stream' : 'Resume Stream'}</span>
          </button>

          <button
            onClick={handleSimulateCrash}
            className="px-3 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Inject Crash Spike</span>
          </button>
        </div>
      </div>

      {!currentVehicle && (
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2.5">
            <Car className="w-4 h-4 text-[#3478F6]" />
            <span>0 vehicles currently registered. Register a vehicle to bind IoT sensor telemetry streams.</span>
          </div>
          <Link
            to="/vehicles/new"
            className="px-3 py-1 bg-[#3478F6] text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add Vehicle
          </Link>
        </div>
      )}

      {/* Sensor Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Velocity (Speed)
          </span>
          <div className="text-xl font-bold text-[#14243A] mt-1">
            {latest?.speed ?? (currentVehicle ? currentVehicle.speed : 0)} <span className="text-xs font-normal text-slate-500">km/h</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Hall Effect / GPS</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Surge Accel (X)
          </span>
          <div className="text-xl font-bold text-[#3478F6] mt-1">
            {latest?.acceleration.x ?? 0.0} <span className="text-xs font-normal text-slate-500">G</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Longitudinal</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Sway Accel (Y)
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {latest?.acceleration.y ?? 0.0} <span className="text-xs font-normal text-slate-500">G</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Lateral force</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Heave Accel (Z)
          </span>
          <div className="text-xl font-bold text-amber-600 mt-1">
            {latest?.acceleration.z ?? 0.0} <span className="text-xs font-normal text-slate-500">G</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Gravity baseline (~1G)</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Piezo Impact
          </span>
          <div className="text-xl font-bold text-rose-600 mt-1">
            {latest?.impactPressure ?? 0.0} <span className="text-xs font-normal text-slate-500">kPa</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Structural Piezo FSR</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Node Thermal
          </span>
          <div className="text-xl font-bold text-slate-700 mt-1">
            {latest?.temperature ? `${latest.temperature.toFixed(1)}°C` : '0.0°C'}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Internal MCU core</span>
        </div>
      </div>

      {/* Live Chart Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#172033]">Continuous Telemetry Waveform</h3>
            <p className="text-xs text-slate-500">
              Sliding 60-second window ({telemetry.length} readings received at 3-second sample interval)
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setChartMode('acceleration')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                chartMode === 'acceleration' ? 'bg-white text-[#14243A] shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Tri-Axial Accel (X,Y,Z)
            </button>
            <button
              onClick={() => setChartMode('speed')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                chartMode === 'speed' ? 'bg-white text-[#14243A] shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Speed (km/h)
            </button>
            <button
              onClick={() => setChartMode('impact')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                chartMode === 'impact' ? 'bg-white text-[#14243A] shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Impact Sensor (kPa)
            </button>
          </div>
        </div>

        <SensorLineChart data={telemetry} type={chartMode} height={280} />
      </div>

      {/* Telemetry Readings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#172033]">Recent Telemetry Packets Log</h3>
            <span className="text-xs text-slate-500">
              Raw packet buffer for {currentVehicle ? currentVehicle.registrationNumber : '0 nodes'}
            </span>
          </div>
          <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-700">
            Node ID: {currentVehicle ? currentVehicle.sensorConfig.iotDeviceId : 'N/A'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 font-sans">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Speed</th>
                <th className="py-2.5 px-3">Accel X / Y / Z</th>
                <th className="py-2.5 px-3">Gyro (Deg/s)</th>
                <th className="py-2.5 px-3">Impact (kPa)</th>
                <th className="py-2.5 px-3">GPS Coordinate</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {telemetry.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans text-xs">
                    0 telemetry packets recorded. Connect or register a vehicle node to stream sensor data.
                  </td>
                </tr>
              ) : (
                telemetry.slice().reverse().slice(0, 10).map((reading, idx) => (
                  <tr key={reading.id || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {new Date(reading.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {reading.speed} km/h
                    </td>
                    <td className="py-2.5 px-3 text-slate-800">
                      {reading.acceleration.x} / {reading.acceleration.y} / {reading.acceleration.z} G
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {reading.gyro.x}° / {reading.gyro.y}° / {reading.gyro.z}°
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-rose-700">
                      {reading.impactPressure}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {reading.gps.lat.toFixed(4)}, {reading.gps.lng.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          reading.status === 'critical'
                            ? 'bg-rose-100 text-rose-700'
                            : reading.status === 'warning'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {reading.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
