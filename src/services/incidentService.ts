import { apiClient } from './apiClient';
import { AccidentIncident, IncidentReviewStatus } from '../types/incident';

export const incidentService = {
  async getIncidents(): Promise<AccidentIncident[]> {
    if (!apiClient.isMockMode) {
      return await apiClient.get<AccidentIncident[]>('/incidents');
    }
    return [];
  },

  async reviewIncident(id: string, status: IncidentReviewStatus, notes?: string): Promise<AccidentIncident> {
    if (!apiClient.isMockMode) {
      return await apiClient.patch<AccidentIncident>(`/incidents/${id}/review`, { status, notes });
    }
    throw new Error('In mock mode, use store.reviewIncident');
  },

  async acknowledgeIncident(id: string): Promise<AccidentIncident> {
    if (!apiClient.isMockMode) {
      return await apiClient.post<AccidentIncident>(`/incidents/${id}/acknowledge`);
    }
    throw new Error('In mock mode, use store.acknowledgeIncident');
  },

  async resolveIncident(id: string): Promise<AccidentIncident> {
    if (!apiClient.isMockMode) {
      return await apiClient.post<AccidentIncident>(`/incidents/${id}/resolve`);
    }
    throw new Error('In mock mode, use store.resolveIncident');
  }
};
