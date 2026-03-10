export type ClientCategory = 'PARTICULIER' | 'CORPORATE' | 'INSTITUTIONNEL';

export enum CommissionType {
  EXCHANGE_CESSION = 'EXCHANGE_CESSION',
  EXCHANGE_VIREMENT = 'EXCHANGE_VIREMENT',
  TRANSFER = 'TRANSFER',
  SWIFT = 'SWIFT',
  CORRESPONDENT = 'CORRESPONDENT',
  FLAT = 'FLAT',
  EXCHANGE_IN = 'EXCHANGE_IN',
}

export interface Account {
  id: number;
  account_number: string;
  currency: string;
}

export interface Client {
  id: number;
  identifier?: string;
  name: string;
  activity: string;
  category: ClientCategory;
  accounts: Account[];
}

export interface CommissionConfig {
  id?: number;
  type: CommissionType;
  is_enabled: boolean;
  is_percentage: boolean;
  percentage_value: number;
  fixed_amount: number;
  has_floor: boolean;
  floor: number;
  has_ceiling: boolean;
  ceiling: number;
}

export interface FeeCalculationRequest {
  client_id: number;
  amount: number;
  type: CommissionType;
}

export interface FeeCalculationResponse {
  type: CommissionType;
  fee: number;
  description: string;
  is_flat_override: boolean;
  is_specific: boolean;
}
