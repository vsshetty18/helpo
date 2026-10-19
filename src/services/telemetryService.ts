import { apiClient } from './apiClient';
import { TelemetryReading } from '../types/telemetry';

export const telemetryService = {
  async getLatestTelemetry(vehicleId: string): Promise<TelemetryReading | null> {
    if (!apiClient.isMockMode) {
      return await apiClient.get<TelemetryReading>(`/telemetry/${vehicleId}/latest`);
    }
    return null;
  },

  async getTelemetryHistory(vehicleId: string, limit: number = 30): Promise<TelemetryReading[]> {
    if (!apiClient.isMockMode) {
      return await apiClient.get<TelemetryReading[]>(`/telemetry/${vehicleId}/history?limit=${limit}`);
    }
    return [];
  }
};
