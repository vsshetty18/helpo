import React, { useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Cpu,
  Database,
  MapPin,
  Save,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Server
} from 'lucide-react';
import { useDataStore } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/common/PageHeader';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetAllData } = useDataStore();
  const { user } = useAuth();
  const { success, warning, info } = useToast();

  const [formState, setFormState] = useState({ ...settings });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormState(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormState(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormState(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formState);
    success('Settings Saved', 'System configurations updated across all modules.');
  };

  const handleResetDemo = () => {
    resetAllData();
    setFormState({ ...settings });
    setShowResetConfirm(false);
    info('System Reset Completed', 'All vehicles, incidents, and notifications restored to initial seed state.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="System Settings & Sensor Thresholds"
        description="Configure dispatcher credentials, telemetry simulation rates, AI inference sensitivity, and API gateway routing."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings' }
        ]}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Administrator Profile */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-slate-100">
            <User className="w-5 h-5 text-[#3478F6]" />
            <div>
              <h2 className="text-base font-bold text-[#172033]">Operations Dispatcher Profile</h2>
              <p className="text-xs text-[#697586]">Safety center administrator identity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dispatcher Name</label>
              <input
                type="text"
                name="adminName"
                value={formState.adminName}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Dispatch Email</label>
              <input
                type="email"
                name="adminEmail"
                value={formState.adminEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operational Role</label>
              <input
                type="text"
                name="role"
                value={formState.role}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Security Session Status</label>
              <div className="px-3 py-2 text-sm bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-medium">
                Active Demo Session (Token Valid)
              </div>
            </div>
          </div>
        </div>

        {/* Sensor & AI Detection Thresholds */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-slate-100">
            <Cpu className="w-5 h-5 text-rose-500" />
            <div>
              <h2 className="text-base font-bold text-[#172033]">AI Crash Detection Sensitivity</h2>
              <p className="text-xs text-[#697586]">Inference triggers for automatic 112 emergency escalation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Impact Threshold (G-Force)
              </label>
              <input
                type="number"
                step="0.5"
                name="highSeverityImpactThresholdG"
                value={formState.highSeverityImpactThresholdG}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: 6.5 G</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Speed Drop Trigger (km/h)
              </label>
              <input
                type="number"
                step="5"
                name="speedDropThresholdKmh"
                value={formState.speedDropThresholdKmh}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: 35.0 km/h drop in &lt;200ms</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ML Model Confidence Cutoff
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="0.99"
                name="mlConfidenceThreshold"
                value={formState.mlConfidenceThreshold}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Range 0.50 – 0.95 (Default: 0.70)</span>
            </div>
          </div>
        </div>

        {/* Emergency Dispatch Channels & Automation */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-slate-100">
            <Bell className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-[#172033]">Automated Emergency Routing</h2>
              <p className="text-xs text-[#697586]">Auto-dispatch rules upon confirmed collision</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="smsAlertsEnabled"
                checked={formState.smsAlertsEnabled}
                onChange={handleChange}
                className="w-4 h-4 text-[#3478F6] rounded"
              />
              <div>
                <strong className="text-slate-800 block">Automatic Kin SMS Transmission</strong>
                <span className="text-slate-500">Sends Google Maps location link & crash notification to driver's family</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="policeCadAutoDispatch"
                checked={formState.policeCadAutoDispatch}
                onChange={handleChange}
                className="w-4 h-4 text-[#3478F6] rounded"
              />
              <div>
                <strong className="text-slate-800 block">City Emergency CAD (112) Direct Stream</strong>
                <span className="text-slate-500">Relays verified telemetry packets to Bengaluru Law & Traffic CAD gateway</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                name="hospitalDirectDispatch"
                checked={formState.hospitalDirectDispatch}
                onChange={handleChange}
                className="w-4 h-4 text-[#3478F6] rounded"
              />
              <div>
                <strong className="text-slate-800 block">Nearest Trauma Ward Yellow Alert</strong>
                <span className="text-slate-500">Transmits blunt-force impact G vectors to prepare trauma bay response</span>
              </div>
            </label>
          </div>
        </div>

        {/* Backend & Simulation Engine Configuration */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-slate-100">
            <Server className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-[#172033]">Python FastAPI Integration & Simulator</h2>
              <p className="text-xs text-[#697586]">Endpoints and simulated clock parameters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">FastAPI Backend URL</label>
              <input
                type="text"
                name="apiBaseUrl"
                value={formState.apiBaseUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: http://localhost:8000/api</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Simulation Tick Interval (ms)</label>
              <input
                type="number"
                step="500"
                min="1000"
                max="10000"
                name="simulationIntervalMs"
                value={formState.simulationIntervalMs}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Controls live GPS/IMU stream frequency (Default: 3000ms)</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data to Seed</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold bg-[#3478F6] hover:bg-blue-600 text-white rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset All Demo Data?"
        message="This will restore all registered vehicles, incidents, telemetry histories, and notifications back to their clean initial state. Any vehicles added during this session will be reset."
        confirmLabel="Reset Everything"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleResetDemo}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
