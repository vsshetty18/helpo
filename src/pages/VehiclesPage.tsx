import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Car,
  Search,
  Filter,
  Plus,
  Trash2,
  Eye,
  MapPin,
  Activity,
  ArrowUpDown,
  MoreVertical,
  CheckCircle2,
  Edit,
  X
} from 'lucide-react';
import { useDataStore } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { formatRelativeTime } from '../utils/formatters';
import { Vehicle } from '../types/vehicle';

export const VehiclesPage: React.FC = () => {
  const { vehicles, deleteVehicle, setSelectedVehicleId, updateVehicle } = useDataStore();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'reg' | 'speed' | 'status' | 'updated'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  // Quick edit modal state
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editOwner, setEditOwner] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<Vehicle['status']>('stationary');

  // Filter & Search
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchSearch =
        v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.model.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (statusFilter === 'all') return true;
      if (statusFilter === 'online') return v.connectionStatus === 'online';
      if (statusFilter === 'offline') return v.connectionStatus === 'offline';
      return v.status === statusFilter;
    });
  }, [vehicles, searchQuery, statusFilter]);

  // Sort
  const sortedVehicles = useMemo(() => {
    return [...filteredVehicles].sort((a, b) => {
      let result = 0;
      if (sortField === 'reg') {
        result = a.registrationNumber.localeCompare(b.registrationNumber);
      } else if (sortField === 'speed') {
        result = a.speed - b.speed;
      } else if (sortField === 'status') {
        result = a.status.localeCompare(b.status);
      } else if (sortField === 'updated') {
        result = new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }
      return sortOrder === 'asc' ? result : -result;
    });
  }, [filteredVehicles, sortField, sortOrder]);

  const handleSort = (field: 'reg' | 'speed' | 'status' | 'updated') => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleViewOnMap = (vehicle: Vehicle) => {
    setSelectedVehicleId(vehicle.id);
    navigate('/tracking');
  };

  const handleDeleteConfirm = () => {
    if (!vehicleToDelete) return;
    deleteVehicle(vehicleToDelete.id);
    success('Vehicle Removed', `${vehicleToDelete.registrationNumber} has been removed from the fleet register.`);
    setVehicleToDelete(null);
  };

  const handleStartEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setEditOwner(v.ownerName);
    setEditPhone(v.ownerPhone);
    setEditStatus(v.status);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;

    updateVehicle(editingVehicle.id, {
      ownerName: editOwner,
      ownerPhone: editPhone,
      status: editStatus
    });

    success('Vehicle Updated', `${editingVehicle.registrationNumber} details saved.`);
    setEditingVehicle(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicle Management"
        description="Monitor, inspect, and configure telemetry nodes for all registered vehicles."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Vehicle Management' }
        ]}
        actions={
          <Link
            to="/vehicles/new"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#3478F6] hover:bg-blue-600 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by registration, owner, make, or model..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#3478F6] text-slate-900"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {[
            { label: 'All Fleet', value: 'all' },
            { label: 'Moving', value: 'moving' },
            { label: 'Stationary', value: 'stationary' },
            { label: 'Incidents', value: 'incident' },
            { label: 'Online', value: 'online' },
            { label: 'Offline', value: 'offline' }
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === f.value
                  ? 'bg-[#14243A] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      {sortedVehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No vehicles match your filter"
          description={searchQuery ? `No vehicles found for "${searchQuery}".` : 'No vehicles found in this category.'}
          action={
            searchQuery || statusFilter !== 'all'
              ? {
                  label: 'Clear Filters',
                  onClick: () => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }
                }
              : undefined
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSort('reg')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Registration Number</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Vehicle Model</th>
                  <th className="py-3 px-4">Owner / Contact</th>
                  <th className="py-3 px-4">Current Location</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSort('speed')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Speed</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSort('updated')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Last Updated</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Connection</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-900"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedVehicles.map(vehicle => (
                  <tr key={vehicle.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#14243A] text-xs">
                        {vehicle.registrationNumber}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Node: {vehicle.sensorConfig.iotDeviceId}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">
                        {vehicle.make} {vehicle.model}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {vehicle.vehicleType} • {vehicle.year}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800">{vehicle.ownerName}</div>
                      <div className="text-[11px] text-slate-500">{vehicle.ownerPhone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate" title={vehicle.currentLocation.address}>
                      {vehicle.currentLocation.address}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {vehicle.speed} km/h
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatRelativeTime(vehicle.lastUpdated)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={vehicle.connectionStatus} type="connection" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={vehicle.status} type="vehicle" />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewOnMap(vehicle)}
                          title="Track on Live Map"
                          className="p-1.5 text-slate-500 hover:text-[#3478F6] hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          to={`/sensors?vehicleId=${vehicle.id}`}
                          title="View Live Telemetry"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Activity className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/vehicles/${vehicle.id}`}
                          title="View Profile Details"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleStartEdit(vehicle)}
                          title="Quick Edit"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setVehicleToDelete(vehicle)}
                          title="Delete Vehicle"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Showing {sortedVehicles.length} of {vehicles.length} registered vehicles</span>
            <span className="font-mono text-[11px]">Bengaluru Telemetry Zone</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!vehicleToDelete}
        title="Deregister Vehicle?"
        message={`Are you sure you want to remove ${vehicleToDelete?.registrationNumber} (${vehicleToDelete?.make} ${vehicleToDelete?.model}) from the VehicleGuard fleet registry? All historical telemetry and sensor streams for this node will be disconnected.`}
        confirmLabel="Deregister Vehicle"
        cancelLabel="Keep Vehicle"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setVehicleToDelete(null)}
      />

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-[#172033]">
                Edit {editingVehicle.registrationNumber}
              </h3>
              <button
                onClick={() => setEditingVehicle(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Owner Name</label>
                <input
                  type="text"
                  required
                  value={editOwner}
                  onChange={e => setEditOwner(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Owner Phone</label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operational Status</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as Vehicle['status'])}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]"
                >
                  <option value="moving">Moving</option>
                  <option value="stationary">Stationary</option>
                  <option value="incident">Incident Alert</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3478F6] hover:bg-blue-600 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
