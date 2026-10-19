import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Car,
  MapPin,
  Activity,
  AlertOctagon,
  Siren,
  FileText,
  Settings,
  LogOut,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { useDataStore } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { incidents, vehicles, isSimulationRunning } = useDataStore();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const pendingIncidents = incidents.filter(i => i.reviewStatus === 'awaiting_review').length;
  const onlineVehicles = vehicles.filter(v => v.connectionStatus === 'online').length;

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Add Vehicle & Sensors', to: '/vehicles/new', icon: PlusCircle },
    {
      label: 'Vehicle Management',
      to: '/vehicles',
      icon: Car,
      badge: `${onlineVehicles}/${vehicles.length}`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300'
    },
    { label: 'Live Tracking Map', to: '/tracking', icon: MapPin },
    { label: 'Sensor Monitoring', to: '/sensors', icon: Activity },
    {
      label: 'Accident Detection',
      to: '/accidents',
      icon: AlertOctagon,
      badge: pendingIncidents > 0 ? String(pendingIncidents) : undefined,
      badgeColor: 'bg-rose-500 text-white font-bold animate-pulse'
    },
    { label: 'Emergency Response', to: '/emergency', icon: Siren },
    { label: 'Accident History & Reports', to: '/history', icon: FileText },
    { label: 'Settings', to: '/settings', icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 bg-[#14243A] text-white flex flex-col h-full border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-[#3478F6] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
            VehicleGuard <span className="text-[#3478F6] text-xs font-black uppercase px-1.5 py-0.5 rounded bg-blue-500/20">AI</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
            Fleet Safety System
          </span>
        </div>
      </div>

      {/* Simulator Pulse Status */}
      <div className="px-5 py-2.5 mx-3 my-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Radio className={`w-3.5 h-3.5 ${isSimulationRunning ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="text-slate-300 font-medium">Simulator:</span>
        </div>
        <span className={`text-[11px] font-semibold ${isSimulationRunning ? 'text-emerald-400' : 'text-slate-400'}`}>
          {isSimulationRunning ? 'ACTIVE (3s)' : 'PAUSED'}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#3478F6] text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User / Session Footer */}
      <div className="p-4 border-t border-slate-800 bg-[#0F1B2B]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.name?.slice(0, 2).toUpperCase() || 'OP'}
            </div>
            <div className="truncate text-left">
              <div className="text-xs font-semibold text-white truncate">{user?.name || 'Operator'}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.role || 'Safety Admin'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out of demo session"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
