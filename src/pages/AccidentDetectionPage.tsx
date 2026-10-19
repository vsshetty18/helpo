import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { useDataStore } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/common/PageHeader';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { AccidentIncident } from '../types/incident';
import { formatDate, formatRelativeTime } from '../utils/formatters';

export const AccidentDetectionPage: React.FC = () => {
  const { incidents, reviewIncident, vehicles, resolveIncident } = useDataStore();
  const { success, warning, info } = useToast();

  const [selectedIncident, setSelectedIncident] = useState<AccidentIncident | null>(() => incidents[0] || null);
  const [filterReviewStatus, setFilterReviewStatus] = useState<string>('all');
  const [showDismissModal, setShowDismissModal] = useState(false);
  const [dismissNotes, setDismissNotes] = useState('');

  // Summary counts
  const totalIncidents = incidents.length;
  const confirmedIncidents = incidents.filter(i => i.reviewStatus === 'confirmed').length;
  const awaitingReview = incidents.filter(i => i.reviewStatus === 'awaiting_review').length;
  const dismissedIncidents = incidents.filter(i => i.reviewStatus === 'dismissed').length;

  const filteredIncidents = incidents.filter(inc => {
    if (filterReviewStatus === 'all') return true;
    return inc.reviewStatus === filterReviewStatus;
  });

  const matchedVehicle = vehicles.find(v => v.id === selectedIncident?.vehicleId);

  const handleConfirmIncident = (inc: AccidentIncident) => {
    reviewIncident(inc.id, 'confirmed', 'Confirmed high-impact accident by safety dispatcher.');
    success('Incident Confirmed', `Incident ${inc.id} verified. Emergency teams notified.`);
    if (selectedIncident?.id === inc.id) {
      setSelectedIncident(prev => (prev ? { ...prev, reviewStatus: 'confirmed' } : null));
    }
  };

  const handleDismissConfirm = () => {
    if (!selectedIncident) return;
    reviewIncident(selectedIncident.id, 'dismissed', dismissNotes || 'Dismissed as false positive/road bump anomaly.');
    warning('Incident Dismissed', `Incident ${selectedIncident.id} tagged as false positive.`);
    setSelectedIncident(prev => (prev ? { ...prev, reviewStatus: 'dismissed' } : null));
    setShowDismissModal(false);
    setDismissNotes('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accident Detection & Telemetry Analysis"
        description="AI collision inference engine. Analyzes sudden deceleration spikes, structural piezo pressure, and rollover vectors."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Accident Detection' }
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Incidents"
          value={totalIncidents}
          subtitle="All detected anomalies"
          icon={<ShieldAlert className="w-5 h-5 text-slate-700" />}
          onClick={() => setFilterReviewStatus('all')}
        />
        <MetricCard
          title="Awaiting Review"
          value={awaitingReview}
          subtitle="Immediate dispatch verification required"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          variant={awaitingReview > 0 ? 'warning' : 'default'}
          onClick={() => setFilterReviewStatus('awaiting_review')}
        />
        <MetricCard
          title="Confirmed Incidents"
          value={confirmedIncidents}
          subtitle="Emergency response initiated"
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          variant="danger"
          onClick={() => setFilterReviewStatus('confirmed')}
        />
        <MetricCard
          title="Dismissed Events"
          value={dismissedIncidents}
          subtitle="Tagged as false positive anomalies"
          icon={<CheckCircle2 className="w-5 h-5 text-slate-500" />}
          onClick={() => setFilterReviewStatus('dismissed')}
        />
      </div>

      {/* Main Grid: Incident Table + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table View */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#172033]">Incident Stream Register</h2>
              <p className="text-xs text-slate-500">Click any row to inspect sensor evidence & review</p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 text-xs">
              {[
                { label: 'All', value: 'all' },
                { label: 'Awaiting', value: 'awaiting_review' },
                { label: 'Confirmed', value: 'confirmed' },
                { label: 'Dismissed', value: 'dismissed' }
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setFilterReviewStatus(tab.value)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    filterReviewStatus === tab.value
                      ? 'bg-[#14243A] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Incident ID</th>
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3">Impact / Speed Drop</th>
                  <th className="py-2.5 px-3">AI Confidence</th>
                  <th className="py-2.5 px-3">Review Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                      0 accident incidents recorded. All fleet nodes operating nominally.
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map(inc => {
                    const isSelected = selectedIncident?.id === inc.id;
                    return (
                      <tr
                        key={inc.id}
                        onClick={() => setSelectedIncident(inc)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/80 font-medium' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <div className="font-bold text-[#14243A]">{inc.id}</div>
                          <div className="text-[10px] text-slate-400">{formatRelativeTime(inc.timestamp)}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{inc.vehicleRegistration}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{inc.location.address}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-rose-700">{inc.sensorEvidence.impactForceG} G</div>
                          <div className="text-[11px] text-slate-500">-{inc.sensorEvidence.speedDropKmh} km/h</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 bg-slate-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  inc.predictionScore > 0.8
                                    ? 'bg-rose-500'
                                    : inc.predictionScore > 0.6
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.round(inc.predictionScore * 100)}%` }}
                              />
                            </div>
                            <span className="font-semibold">{Math.round(inc.predictionScore * 100)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={inc.reviewStatus} type="incident" />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIncident(inc);
                            }}
                            className="text-[#3478F6] hover:underline font-semibold"
                          >
                            Review &rarr;
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Incident Detail Drawer */}
        {selectedIncident ? (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Incident Detail
                </span>
                <h3 className="text-base font-bold text-[#14243A]">{selectedIncident.id}</h3>
                <span className="text-xs text-slate-500">{formatDate(selectedIncident.timestamp)}</span>
              </div>
              <StatusBadge status={selectedIncident.reviewStatus} type="incident" />
            </div>

            {/* Target Vehicle Details */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle:</span>
                <strong className="text-slate-800">{selectedIncident.vehicleRegistration}</strong>
              </div>
              {matchedVehicle && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Model:</span>
                    <span className="text-slate-700">{matchedVehicle.make} {matchedVehicle.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Owner:</span>
                    <span className="text-slate-700">{matchedVehicle.ownerName} ({matchedVehicle.ownerPhone})</span>
                  </div>
                </>
              )}
            </div>

            {/* Sensor Evidence Analysis */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Telemetry Evidence
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="text-[10px] text-slate-400 block">Peak Impact Force</span>
                  <span className="text-base font-bold text-rose-600">
                    {selectedIncident.sensorEvidence.impactForceG} G
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="text-[10px] text-slate-400 block">Speed Drop</span>
                  <span className="text-base font-bold text-amber-600">
                    -{selectedIncident.sensorEvidence.speedDropKmh} km/h
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="text-[10px] text-slate-400 block">Airbag Deployed</span>
                  <span className="font-semibold text-slate-800">
                    {selectedIncident.sensorEvidence.airbagDeploymentStatus ? 'YES (Confirmed)' : 'NO'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                  <span className="text-[10px] text-slate-400 block">Rollover Vector</span>
                  <span className="font-semibold text-slate-800">
                    {selectedIncident.sensorEvidence.rolloverDetected ? 'YES' : 'NO'}
                  </span>
                </div>
              </div>
            </div>

            {/* Incident Chronology Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Event Chronology
              </h4>
              <div className="space-y-2 border-l-2 border-slate-200 pl-3 text-xs">
                {selectedIncident.timeline.map((item, idx) => (
                  <div key={idx} className="relative">
                    <span className="text-[10px] text-slate-400 font-mono block">{item.time}</span>
                    <span className="text-slate-700 leading-snug">{item.event}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operator Review Actions */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-xs font-semibold text-slate-700 block">Dispatcher Action:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleConfirmIncident(selectedIncident)}
                  className="px-3 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Crash</span>
                </button>
                <button
                  onClick={() => setShowDismissModal(true)}
                  className="px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Dismiss Event</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-slate-300 mb-2" />
            <span className="font-semibold text-slate-700 block">0 Incidents Detected</span>
            <span className="text-[11px] text-slate-400 mt-0.5">When an accident anomaly occurs, telemetry evidence and ML prediction scores will display here.</span>
          </div>
        )}
      </div>

      {/* Dismiss Confirmation Modal */}
      <ConfirmDialog
        isOpen={showDismissModal}
        title="Dismiss Incident as False Positive?"
        message={`Are you sure you want to dismiss incident ${selectedIncident?.id} on ${selectedIncident?.vehicleRegistration}? This will classify the event as a false alarm.`}
        confirmLabel="Dismiss Incident"
        cancelLabel="Cancel"
        variant="warning"
        onConfirm={handleDismissConfirm}
        onCancel={() => setShowDismissModal(false)}
      />
    </div>
  );
};
