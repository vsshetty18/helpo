import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Play,
  Pause,
  Zap,
  Server,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useDataStore } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const {
    isSimulationRunning,
    toggleSimulation,
    triggerSimulatedAccident,
    vehicles,
    notifications,
    resetAllData
  } = useDataStore();
  const { success, warning, info } = useToast();
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const handleSimToggle = () => {
    toggleSimulation();
    if (isSimulationRunning) {
      warning('Simulation Paused', 'Vehicle telemetry ticks and motion updates are paused.');
    } else {
      success('Simulation Resumed', 'Streaming simulated vehicle telemetry every 3s.');
    }
  };

  const handleTriggerAccident = () => {
    // Find a moving vehicle to trigger an accident on
    const movingVeh = vehicles.find(v => v.status === 'moving') || vehicles[0];
    if (!movingVeh) {
      warning('No vehicle available', 'Register a vehicle first to simulate an accident.');
      return;
    }

    const inc = triggerSimulatedAccident(movingVeh.id);
    if (inc) {
      warning(
        `CRITICAL: Accident Simulated on ${movingVeh.registrationNumber}`,
        `Deceleration spike detected (9.2G). New emergency dispatch generated.`
      );
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to default initial state?')) {
      resetAllData();
      info('Demo Data Reset', 'Initial vehicles, incidents, and telemetry restored.');
    }
  };

  const unreadNotifs = notifications.slice(0, 5);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile hamburger & Environment Status */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
          <Server className="w-3.5 h-3.5 text-[#3478F6]" />
          <span>FastAPI Client:</span>
          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold text-[11px]">
            Mock Adapter Active
          </span>
        </div>
      </div>

      {/* Right: Actions, Simulation Controls, Notifications */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Reset Demo Data quick button */}
        <button
          onClick={handleResetData}
          title="Reset Demo Data"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo</span>
        </button>

        {/* Simulation Pause / Resume button */}
        <button
          onClick={handleSimToggle}
          title={isSimulationRunning ? 'Pause GPS/Sensor Simulation' : 'Resume GPS/Sensor Simulation'}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
            isSimulationRunning
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
        >
          {isSimulationRunning ? <Pause className="w-3.5 h-3.5 text-emerald-700 fill-emerald-700" /> : <Play className="w-3.5 h-3.5 text-amber-700 fill-amber-700" />}
          <span className="hidden sm:inline">{isSimulationRunning ? 'Sim Active' : 'Sim Paused'}</span>
        </button>

        {/* Quick Demo Trigger: Simulate Accident */}
        <button
          onClick={handleTriggerAccident}
          title="Simulate high-G crash on a vehicle"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span>Simulate Crash</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Emergency Alerts Log</span>
                <Link
                  to="/emergency"
                  onClick={() => setShowNotifMenu(false)}
                  className="text-xs text-[#3478F6] hover:underline font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {unreadNotifs.map(n => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800">{n.vehicleRegistration}</span>
                      <span className="text-[10px] text-slate-500">{new Date(n.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-600 line-clamp-2 leading-relaxed">{n.messagePreview}</p>
                    <div className="mt-1.5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Recipient: {n.recipient}</span>
                      <span className="text-emerald-600 font-medium">{n.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
