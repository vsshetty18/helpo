import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { AddVehiclePage } from './pages/AddVehiclePage';
import { VehicleDetailsPage } from './pages/VehicleDetailsPage';
import { LiveTrackingPage } from './pages/LiveTrackingPage';
import { SensorMonitoringPage } from './pages/SensorMonitoringPage';
import { AccidentDetectionPage } from './pages/AccidentDetectionPage';
import { EmergencyResponsePage } from './pages/EmergencyResponsePage';
import { AccidentHistoryPage } from './pages/AccidentHistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated Dashboard & Operations Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="vehicles/new" element={<AddVehiclePage />} />
        <Route path="vehicles/:id" element={<VehicleDetailsPage />} />
        <Route path="tracking" element={<LiveTrackingPage />} />
        <Route path="sensors" element={<SensorMonitoringPage />} />
        <Route path="accidents" element={<AccidentDetectionPage />} />
        <Route path="emergency" element={<EmergencyResponsePage />} />
        <Route path="history" element={<AccidentHistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
