import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Cpu,
  PhoneCall,
  Save,
  RotateCcw,
  X,
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useDataStore } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { VehicleType } from '../types/vehicle';
import { PageHeader } from '../components/common/PageHeader';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface FormState {
  registrationNumber: string;
  make: string;
  model: string;
  vehicleType: VehicleType;
  year: number;
  ownerName: string;
  ownerPhone: string;
  gpsDeviceId: string;
  motionSensorId: string;
  pressureSensorId: string;
  iotDeviceId: string;
  dataSource: 'simulator' | 'physical';
  emergencyContactName: string;
  emergencyContactPhone: string;
  secondaryPhone: string;
  relationship: string;
  consentGiven: boolean;
}

const INITIAL_FORM: FormState = {
  registrationNumber: '',
  make: '',
  model: '',
  vehicleType: 'SUV',
  year: 2024,
  ownerName: '',
  ownerPhone: '',
  gpsDeviceId: `GPS-BLR-${Math.floor(1000 + Math.random() * 9000)}`,
  motionSensorId: 'IMU-MPU6050-AXIS',
  pressureSensorId: 'PIEZO-CRASH-FSR',
  iotDeviceId: `ESP32-VG-NODE-${Math.floor(10 + Math.random() * 89)}`,
  dataSource: 'simulator',
  emergencyContactName: '',
  emergencyContactPhone: '',
  secondaryPhone: '',
  relationship: 'Spouse',
  consentGiven: true
};

export const AddVehiclePage: React.FC = () => {
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const { addVehicle, vehicles } = useDataStore();
  const { success, error: toastError, warning } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setIsDirty(true);
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear field-specific error
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.registrationNumber.trim()) {
      errs.registrationNumber = 'Registration number is required (e.g. KA-01-AB-1234)';
    } else {
      // Check duplicate
      const isDup = vehicles.some(
        v => v.registrationNumber.trim().toUpperCase() === formData.registrationNumber.trim().toUpperCase()
      );
      if (isDup) {
        errs.registrationNumber = 'A vehicle with this registration number is already registered';
      }
    }

    if (!formData.make.trim()) errs.make = 'Vehicle make is required';
    if (!formData.model.trim()) errs.model = 'Vehicle model is required';
    if (!formData.ownerName.trim()) errs.ownerName = 'Owner name is required';
    if (!formData.ownerPhone.trim()) {
      errs.ownerPhone = 'Owner contact number is required';
    } else if (formData.ownerPhone.length < 10) {
      errs.ownerPhone = 'Enter a valid phone number (at least 10 digits)';
    }

    if (!formData.emergencyContactName.trim()) errs.emergencyContactName = 'Emergency contact name is required';
    if (!formData.emergencyContactPhone.trim()) {
      errs.emergencyContactPhone = 'Emergency contact phone is required for automated dispatch';
    }

    if (!formData.consentGiven) {
      errs.consentGiven = 'Consent authorization is required for automated emergency services dispatch';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toastError('Validation Failed', 'Please fix highlighted errors in the form.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Create new vehicle object
      const result = addVehicle({
        registrationNumber: formData.registrationNumber.trim().toUpperCase(),
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: Number(formData.year),
        vehicleType: formData.vehicleType,
        ownerName: formData.ownerName.trim(),
        ownerPhone: formData.ownerPhone.trim(),
        status: 'stationary',
        connectionStatus: 'online',
        currentLocation: {
          lat: 12.9716 + (Math.random() * 0.04 - 0.02),
          lng: 77.5946 + (Math.random() * 0.04 - 0.02),
          address: 'Central Bengaluru, Karnataka (Simulated Geofence)'
        },
        speed: 0,
        heading: Math.floor(Math.random() * 360),
        sensorConfig: {
          gpsDeviceId: formData.gpsDeviceId,
          motionSensorId: formData.motionSensorId,
          pressureSensorId: formData.pressureSensorId,
          iotDeviceId: formData.iotDeviceId,
          dataSource: formData.dataSource
        },
        emergencyContact: {
          name: formData.emergencyContactName.trim(),
          phone: formData.emergencyContactPhone.trim(),
          secondaryPhone: formData.secondaryPhone.trim() || undefined,
          relationship: formData.relationship,
          consentGiven: formData.consentGiven
        },
        fuelOrBatteryPercent: 100
      });

      setIsSubmitting(false);

      if (result.success && result.vehicle) {
        success('Vehicle Registered Successfully', `${result.vehicle.registrationNumber} is now active in fleet tracking.`);
        setIsDirty(false);
        navigate(`/vehicles/${result.vehicle.id}`);
      } else {
        toastError('Registration Failed', result.error || 'Could not register vehicle');
      }
    }, 500);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setIsDirty(false);
    warning('Form Reset', 'All input fields cleared to defaults.');
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      navigate('/vehicles');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Vehicle & Sensors"
        description="Register a new fleet vehicle, configure telemetry sensor nodes, and define automated emergency contacts."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Vehicles', href: '/vehicles' },
          { label: 'Add New' }
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Section A: Vehicle Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#3478F6] flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172033]">Section A — Vehicle Details</h2>
              <p className="text-xs text-[#697586]">Primary vehicle specifications and owner identity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Registration Number *
              </label>
              <input
                type="text"
                name="registrationNumber"
                placeholder="e.g. KA-01-AB-1234"
                value={formData.registrationNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm uppercase rounded-lg border ${
                  errors.registrationNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                } focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]`}
              />
              {errors.registrationNumber && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.registrationNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Vehicle Type *
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]"
              >
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Truck">Truck / Heavy Vehicle</option>
                <option value="Ambulance">Emergency Ambulance</option>
                <option value="Bus">Passenger Bus</option>
                <option value="Van">Commercial Van</option>
                <option value="Electric EV">Electric Vehicle (EV)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Vehicle Make *
              </label>
              <input
                type="text"
                name="make"
                placeholder="e.g. Tata, Mahindra, Hyundai"
                value={formData.make}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  errors.make ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                } focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]`}
              />
              {errors.make && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.make}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Vehicle Model *
              </label>
              <input
                type="text"
                name="model"
                placeholder="e.g. Harrier, XUV700, Creta"
                value={formData.model}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  errors.model ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                } focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]`}
              />
              {errors.model && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.model}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Manufacturing Year
              </label>
              <input
                type="number"
                name="year"
                min="2010"
                max="2026"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Owner / Fleet Custodian Name *
              </label>
              <input
                type="text"
                name="ownerName"
                placeholder="Full Name"
                value={formData.ownerName}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  errors.ownerName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                } focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]`}
              />
              {errors.ownerName && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.ownerName}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Owner Mobile Contact *
              </label>
              <input
                type="tel"
                name="ownerPhone"
                placeholder="+91 98450 12345"
                value={formData.ownerPhone}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  errors.ownerPhone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                } focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]`}
              />
              {errors.ownerPhone && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.ownerPhone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section B: Sensor Configuration */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172033]">Section B — Sensor Configuration</h2>
              <p className="text-xs text-[#697586]">Telemetry IoT controller and onboard sensor node bindings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Data Source Model
              </label>
              <select
                name="dataSource"
                value={formData.dataSource}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#3478F6] bg-slate-50 font-medium"
              >
                <option value="simulator">Software Simulator (Realistic Stream)</option>
                <option value="physical">Physical Hardware Device (ESP32/STM32)</option>
              </select>
              <span className="text-[11px] text-[#697586] mt-1 block">
                {formData.dataSource === 'simulator'
                  ? 'Simulated coordinates in Bengaluru with live physics telemetry ticks.'
                  : 'Expects incoming telemetry via MQTT / FastAPI backend ingestion.'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                IoT Node Device ID
              </label>
              <input
                type="text"
                name="iotDeviceId"
                value={formData.iotDeviceId}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                GPS Module ID
              </label>
              <input
                type="text"
                name="gpsDeviceId"
                value={formData.gpsDeviceId}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Motion IMU Sensor ID
              </label>
              <input
                type="text"
                name="motionSensorId"
                value={formData.motionSensorId}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Pressure / Impact Sensor ID
              </label>
              <input
                type="text"
                name="pressureSensorId"
                value={formData.pressureSensorId}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]"
              />
            </div>
          </div>
        </div>

        {/* Section C: Emergency Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172033]">Section C — Emergency Information</h2>
              <p className="text-xs text-[#697586]">Automated alerts dispatched to emergency kin and 112 services upon crash detection</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Primary Emergency Contact Name *
              </label>
              <input
                type="text"
                name="emergencyContactName"
                placeholder="e.g. Jane Doe"
                value={formData.emergencyContactName}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  errors.emergencyContactName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                } focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]`}
              />
              {errors.emergencyContactName && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.emergencyContactName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Relationship
              </label>
              <select
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]"
              >
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Child">Son / Daughter</option>
                <option value="Fleet Supervisor">Fleet Dispatch Desk</option>
                <option value="Other">Other Kin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Primary Emergency Phone *
              </label>
              <input
                type="tel"
                name="emergencyContactPhone"
                placeholder="+91 99001 22334"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  errors.emergencyContactPhone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                } focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]`}
              />
              {errors.emergencyContactPhone && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.emergencyContactPhone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">
                Optional Secondary Phone
              </label>
              <input
                type="tel"
                name="secondaryPhone"
                placeholder="+91 80 2558 0000"
                value={formData.secondaryPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#3478F6]"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="consentGiven"
                  checked={formData.consentGiven}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-[#3478F6] rounded border-slate-300 focus:ring-[#3478F6]"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  I authorize VehicleGuard AI to automatically transmit GPS coordinates and telemetry impact packets to the local emergency dispatch center (Dial 112) and specified medical contacts upon high-G collision detection.
                </span>
              </label>
              {errors.consentGiven && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.consentGiven}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Form</span>
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-bold text-white bg-[#3478F6] hover:bg-blue-600 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Registering Node...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Register Vehicle</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Discard confirmation dialog */}
      <ConfirmDialog
        isOpen={showDiscardConfirm}
        title="Discard Unsaved Changes?"
        message="You have unsaved vehicle information. Leaving now will discard your inputs."
        confirmLabel="Discard & Leave"
        cancelLabel="Continue Editing"
        variant="warning"
        onConfirm={() => {
          setShowDiscardConfirm(false);
          navigate('/vehicles');
        }}
        onCancel={() => setShowDiscardConfirm(false)}
      />
    </div>
  );
};
