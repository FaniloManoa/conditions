import axios from 'axios';
import { type Client, type CommissionConfig, CommissionType, type FeeCalculationResponse } from './types.ts';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const clientService = {
  getClients: () => api.get<Client[]>('/clients').then(res => res.data),
  createClient: (client: any) => api.post<Client>('/clients', client).then(res => res.data),
  getClient: (id: number) => api.get<Client>(`/clients/${id}`).then(res => res.data),
  getCommission: (clientId: number, type: CommissionType) => 
    api.get<CommissionConfig>(`/clients/${clientId}/commissions/${type}`).then(res => res.data),
  updateCommission: (clientId: number, config: CommissionConfig) =>
    api.post<CommissionConfig>(`/clients/${clientId}/commissions`, config).then(res => res.data),
  calculateFee: (clientId: number, type: CommissionType, amount: number, exchangeRate: number) =>
    api.post<FeeCalculationResponse>('/calculate', { 
      client_id: clientId, 
      type, 
      amount, 
      exchange_rate: exchangeRate 
    }).then(res => res.data),
  getGlobalCommissions: (category: string) => 
    api.get<any[]>(`/commissions/global/${category}`).then(res => res.data),
  updateGlobalCommission: (category: string, config: any) =>
    api.post<any>(`/commissions/global/${category}`, config).then(res => res.data),
  seed: () => api.post('/seed').then(res => res.data),
};
