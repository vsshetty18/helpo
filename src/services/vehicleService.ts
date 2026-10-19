import { apiClient } from './apiClient';
import { Vehicle } from '../types/vehicle';

export const vehicleService = {
  async getAllVehicles(): Promise<Vehicle[]> {
    if (!apiClient.isMockMode) {
      return await apiClient.get<Vehicle[]>('/vehicles');
    }
    // Mock mode delegates to local state/store
    return [];
  },

  async getVehicleById(id: string): Promise<Vehicle | null> {
    if (!apiClient.isMockMode) {
      return await apiClient.get<Vehicle>(`/vehicles/${id}`);
    }
    return null;
  },

  async createVehicle(payload: Omit<Vehicle, 'id' | 'lastUpdated'>): Promise<Vehicle> {
    if (!apiClient.isMockMode) {
      return await apiClient.post<Vehicle>('/vehicles', payload);
    }
    throw new Error('In mock mode, use store.addVehicle');
  },

  async updateVehicle(id: string, payload: Partial<Vehicle>): Promise<Vehicle> {
    if (!apiClient.isMockMode) {
      return await apiClient.put<Vehicle>(`/vehicles/${id}`, payload);
    }
    throw new Error('In mock mode, use store.updateVehicle');
  },

  async deleteVehicle(id: string): Promise<boolean> {
    if (!apiClient.isMockMode) {
      await apiClient.delete(`/vehicles/${id}`);
      return true;
    }
    throw new Error('In mock mode, use store.deleteVehicle');
  }
};
