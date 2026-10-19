import React, { useState } from 'react';
import {
  Siren,
  Hospital,
  Shield,
  PhoneCall,
  Send,
  RotateCcw,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  AlertOctagon,
  Check
} from 'lucide-react';
import { useDataStore } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { VehicleMap } from '../components/maps/VehicleMap';
import { NotificationChannel } from '../types/notification';
import { formatDate, formatRelativeTime, formatCoordinates } from '../utils/formatters';

export const EmergencyResponsePage: React.FC = () => {
  const {
    incidents,
    notifications,
    facilities,
    vehicles,
    sendEmergencyAlert,
    retryNotification,
    acknowledgeIncident,
    resolveIncident
  } = useDataStore();
  const { success, info, warning } = useToast();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(() => incidents[0]?.id || '');
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel>('SMS');

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];
  const matchedVehicle = vehicles.find(v => v.id === selectedIncident?.vehicleId);

  // Notifications relevant to selected incident
  const incidentNotifications = notifications.filter(n => n.incidentId === selectedIncident?.id);

  const hospitals = facilities.filter(f => f.type === 'hospital');
  const policeStations = facilities.filter(f => f.type === 'police' || f.type === 'fire_station');

  const handleSendTestAlert = () => {
    if (!selectedIncident) return;
    const notif = sendEmergencyAlert(selectedIncident.id, selectedChannel);
    if (notif) {
      success(
        `Simulated ${selectedChannel} Dispatched`,
        `Alert generated for ${notif.recipient} (${notif.phone}). Progressing to Delivered.`
      );
    }
  };

  const handleRetryAlert = (notifId: string) => {
    retryNotification(notifId);
    info('Alert Retried', 'Simulated packet retransmitted to carrier gateway.');
  };

  const handleAcknowledge = () => {
    if (!selectedIncident) return;
    acknowledgeIncident(selectedIncident.id);
    success('Incident Acknowledged', `Dispatch desk confirmed handling of ${selectedIncident.id}.`);
  };

  const handleResolve = () => {
    if (!selectedIncident) return;
    resolveIncident(selectedIncident.id);
    success('Incident Resolved', `Incident ${selectedIncident.id} closed. Vehicle returned to stationary state.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency Response & Automated CAD Dispatch"
        description="Coordinated emergency routing. Dispatches geo-tagged incident packets to nearest trauma wards, Dial 112 police CAD, and primary kin."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Emergency Response' }
        ]}
        actions={
          <>
            <button
              onClick={handleAcknowledge}
              className="px-3 py-2 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-[#3478F6] border border-blue-200 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Acknowledged</span>
            </button>
            <button
              onClick={handleResolve}
              className="px-3 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Resolve Incident</span>
            </button>
          </>
        }
      />

      {/* Incident Switcher bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex items-center gap-3 overflow-x-auto">
        <span className="text-xs font-bold text-slate-700 shrink-0">Active Incident:</span>
        <div className="flex items-center gap-2">
          {incidents.length === 0 ? (
            <span className="text-xs text-slate-400">0 active incidents</span>
          ) : (
            incidents.map(inc => {
              const isSelected = selectedIncident?.id === inc.id;
              return (
                <button
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#14243A] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{inc.id} ({inc.vehicleRegistration})</span>
                  <span className={`w-2 h-2 rounded-full ${inc.severity === 'critical' ? 'bg-rose-500' : 'bg-amber-400'}`} />
                </button>
              );
            })
          )}
        </div>
      </div>

      {selectedIncident ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Incident Location, Facilities & Notification Dispatch */}
          <div className="lg:col-span-2 space-y-6">
            {/* Incident Map Overview */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#172033]">Incident Crash Site & Nearby Responders</h3>
                  <p className="text-xs text-slate-500">
                    {selectedIncident.location.address} ({formatCoordinates(selectedIncident.location.lat, selectedIncident.location.lng)})
                  </p>
                </div>
                <StatusBadge status={selectedIncident.severity} type="severity" />
              </div>

              <div className="rounded-lg overflow-hidden border border-slate-100">
                <VehicleMap
                  vehicles={matchedVehicle ? [matchedVehicle] : []}
                  selectedVehicle={matchedVehicle || null}
                  facilities={facilities}
                  showFacilities={true}
                  height="300px"
                />
              </div>
            </div>

            {/* Nearby Emergency Facilities (Hospitals & Police) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nearby Hospitals */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 text-rose-600 font-bold text-xs uppercase tracking-wider">
                  <Hospital className="w-4 h-4" />
                  <span>Nearby Trauma Centers</span>
                </div>
                <div className="space-y-3 text-xs">
                  {hospitals.length === 0 ? (
                    <p className="text-slate-400 text-xs py-4 text-center">0 trauma centers mapped.</p>
                  ) : (
                    hospitals.map(hosp => (
                      <div key={hosp.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex justify-between items-start font-semibold text-slate-800">
                          <span className="truncate max-w-[180px]">{hosp.name}</span>
                          <span className="text-rose-600 shrink-0 font-bold">{hosp.distanceKm} km (ETA {hosp.etaMinutes}m)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{hosp.address}</p>
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 font-mono font-medium">{hosp.phone}</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                            {hosp.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Nearby Police & Fire Stations */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 text-blue-700 font-bold text-xs uppercase tracking-wider">
                  <Shield className="w-4 h-4" />
                  <span>Law Enforcement (Dial 112)</span>
                </div>
                <div className="space-y-3 text-xs">
                  {policeStations.length === 0 ? (
                    <p className="text-slate-400 text-xs py-4 text-center">0 police stations mapped.</p>
                  ) : (
                    policeStations.map(station => (
                      <div key={station.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex justify-between items-start font-semibold text-slate-800">
                          <span className="truncate max-w-[180px]">{station.name}</span>
                          <span className="text-blue-600 shrink-0 font-bold">{station.distanceKm} km</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{station.address}</p>
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 font-mono font-medium">{station.phone}</span>
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold text-[10px]">
                            {station.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Simulated Notification Dispatch Pipeline */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-[#172033]">Emergency Notification Outbox</h3>
                  <p className="text-xs text-slate-500">Live delivery statuses for this incident</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedChannel}
                    onChange={e => setSelectedChannel(e.target.value as NotificationChannel)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium"
                  >
                    <option value="SMS">Channel: SMS Text</option>
                    <option value="Automated Voice Call">Channel: Voice Call</option>
                    <option value="Emergency Services CAD">Channel: 112 CAD</option>
                    <option value="Hospital Direct Alert">Channel: Trauma Direct</option>
                  </select>

                  <button
                    onClick={handleSendTestAlert}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#3478F6] hover:bg-blue-600 text-white rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Test Alert</span>
                  </button>
                </div>
              </div>

              {incidentNotifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No emergency notifications dispatched yet. Click "Send Test Alert" to simulate.
                </div>
              ) : (
                <div className="space-y-3">
                  {incidentNotifications.map(notif => (
                    <div
                      key={notif.id}
                      className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-800 flex items-center gap-2">
                            <span>{notif.recipient}</span>
                            <span className="text-[10px] font-normal text-slate-500">({notif.recipientRole})</span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {notif.phone} • Channel: {notif.channel}
                          </span>
                        </div>
                        <StatusBadge status={notif.status} type="notification" />
                      </div>

                      <div className="p-2.5 bg-white rounded border border-slate-200 text-slate-700 font-mono text-[11px] leading-relaxed">
                        {notif.messagePreview}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Dispatched: {formatDate(notif.timestamp)}</span>
                        {notif.status === 'Failed' && (
                          <button
                            onClick={() => handleRetryAlert(notif.id)}
                            className="text-[#3478F6] hover:underline font-semibold flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" /> Retry Transmission
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Driver & Kin Profile Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Subject Profile
                </span>
                <h3 className="text-base font-bold text-[#14243A]">
                  {selectedIncident.vehicleRegistration}
                </h3>
                <span className="text-xs text-slate-500">
                  {matchedVehicle?.make} {matchedVehicle?.model} ({matchedVehicle?.vehicleType})
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Registered Owner</span>
                  <strong className="text-slate-800">{matchedVehicle?.ownerName}</strong>
                  <div className="text-slate-600 font-mono text-[11px]">{matchedVehicle?.ownerPhone}</div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Primary Kin Contact</span>
                  <strong className="text-slate-800">{matchedVehicle?.emergencyContact.name}</strong>
                  <div className="text-slate-600 font-mono text-[11px]">{matchedVehicle?.emergencyContact.phone}</div>
                  <span className="text-[10px] text-slate-500">Relationship: {matchedVehicle?.emergencyContact.relationship}</span>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Incident Anomaly Score</span>
                  <div className="text-xl font-bold text-rose-600 mt-0.5">
                    {Math.round(selectedIncident.predictionScore * 100)}% Confidence
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Severity: {selectedIncident.severity.toUpperCase()} ({selectedIncident.sensorEvidence.impactForceG}G Peak)
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <a
                  href={`https://maps.google.com/?q=${selectedIncident.location.lat},${selectedIncident.location.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-[#3478F6] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Open in External Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500 flex flex-col items-center justify-center">
          <Hospital className="w-10 h-10 text-slate-300 mb-2" />
          <span className="font-semibold text-slate-700 block">0 Active Emergency Incidents</span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            No vehicle crash events currently require Dial 112 CAD or hospital trauma routing.
          </span>
        </div>
      )}
    </div>
  );
};
