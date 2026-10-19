import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Search,
  Filter,
  BarChart3,
  Calendar,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useDataStore } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { IncidentTrendChart } from '../components/charts/IncidentTrendChart';
import { downloadCSV, formatDate, formatRelativeTime } from '../utils/formatters';
import { AccidentIncident } from '../types/incident';

export const AccidentHistoryPage: React.FC = () => {
  const { incidents, vehicles } = useDataStore();
  const { success } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVehicleReg, setSelectedVehicleReg] = useState('all');

  // Filtered dataset
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const matchSearch =
        inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.vehicleRegistration.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.location.address.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
      if (statusFilter !== 'all' && inc.reviewStatus !== statusFilter) return false;
      if (selectedVehicleReg !== 'all' && inc.vehicleRegistration !== selectedVehicleReg) return false;

      return true;
    });
  }, [incidents, searchQuery, severityFilter, statusFilter, selectedVehicleReg]);

  // Export to CSV
  const handleExportCSV = () => {
    const rows = filteredIncidents.map(inc => ({
      incidentId: inc.id,
      vehicleRegistration: inc.vehicleRegistration,
      timestamp: inc.timestamp,
      severity: inc.severity,
      reviewStatus: inc.reviewStatus,
      impactForceG: inc.sensorEvidence.impactForceG,
      speedDropKmh: inc.sensorEvidence.speedDropKmh,
      airbagDeployed: inc.sensorEvidence.airbagDeploymentStatus ? 'Yes' : 'No',
      predictionScore: (inc.predictionScore * 100).toFixed(1) + '%',
      address: inc.location.address,
      latitude: inc.location.lat,
      longitude: inc.location.lng,
      reviewedBy: inc.reviewedBy || 'Unassigned',
      reviewedAt: inc.reviewedAt || 'Pending'
    }));

    const headers = [
      { key: 'incidentId', label: 'Incident ID' },
      { key: 'vehicleRegistration', label: 'Vehicle Registration' },
      { key: 'timestamp', label: 'Detection Timestamp' },
      { key: 'severity', label: 'Severity' },
      { key: 'reviewStatus', label: 'Review Status' },
      { key: 'impactForceG', label: 'Impact Force (G)' },
      { key: 'speedDropKmh', label: 'Speed Drop (km/h)' },
      { key: 'airbagDeployed', label: 'Airbag Deployed' },
      { key: 'predictionScore', label: 'AI Score' },
      { key: 'address', label: 'Location Address' },
      { key: 'latitude', label: 'Latitude' },
      { key: 'longitude', label: 'Longitude' },
      { key: 'reviewedBy', label: 'Reviewer' },
      { key: 'reviewedAt', label: 'Reviewed At' }
    ];

    downloadCSV(`VehicleGuard_Incident_Report_${new Date().toISOString().slice(0, 10)}`, rows, headers);
    success('CSV Report Exported', `Downloaded ${rows.length} incident records successfully.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accident History & Audit Reports"
        description="Searchable archive of historical vehicle collisions, sensor telemetry spikes, and compliance dispatch reports."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports & History' }
        ]}
        actions={
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#14243A] hover:bg-slate-800 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV ({filteredIncidents.length})</span>
          </button>
        }
      />

      {/* Analytics Charts derived from identical dataset */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#172033]">Incident Severity Distribution</h3>
            <span className="text-xs text-slate-500 font-medium">{filteredIncidents.length} Records</span>
          </div>
          <IncidentTrendChart incidents={filteredIncidents} type="donut" height={200} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#172033]">Weekly Incident Volume</h3>
            <span className="text-xs text-slate-500 font-medium">Recorded Events</span>
          </div>
          <IncidentTrendChart incidents={filteredIncidents} type="bar" height={200} />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, registration, address..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#3478F6]"
            />
          </div>

          {/* Vehicle Filter */}
          <select
            value={selectedVehicleReg}
            onChange={e => setSelectedVehicleReg(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">All Vehicles</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.registrationNumber}>
                {v.registrationNumber} ({v.make})
              </option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Impact (&gt;6G)</option>
            <option value="high">High Severity</option>
            <option value="moderate">Moderate Severity</option>
            <option value="low">Low / Minor Bump</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">All Review Statuses</option>
            <option value="awaiting_review">Awaiting Review</option>
            <option value="confirmed">Confirmed Crash</option>
            <option value="dismissed">Dismissed (False Positive)</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Impact / Speed</th>
                <th className="py-3 px-4">AI Score</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Review Status</th>
                <th className="py-3 px-4">Reviewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    0 incident records found. No historical collisions recorded.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#14243A]">
                      {inc.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {inc.vehicleRegistration}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {formatDate(inc.timestamp)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate" title={inc.location.address}>
                      {inc.location.address}
                    </td>
                    <td className="py-3 px-4 text-slate-800">
                      <strong className="text-rose-600">{inc.sensorEvidence.impactForceG} G</strong>
                      <span className="text-slate-400 text-[11px] ml-1">(-{inc.sensorEvidence.speedDropKmh} km/h)</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {Math.round(inc.predictionScore * 100)}%
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={inc.severity} type="severity" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={inc.reviewStatus} type="incident" />
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {inc.reviewedBy || 'Pending'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>{filteredIncidents.length} incident records matching filter</span>
          <span className="font-mono text-[11px]">Audit Compliant • Real-time Sync</span>
        </div>
      </div>
    </div>
  );
};
