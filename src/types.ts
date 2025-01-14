export type BusinessStatus = 
  | 'Prospectar' 
  | 'Mensagem enviada' 
  | 'Cliente fechado' 
  | 'Cliente perdido';

export interface Business {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  address: string;
  phone?: string;
  website?: string;
  status?: BusinessStatus;
  selected?: boolean;
  inLeads?: boolean;
}

export interface BusinessFormData {
  name: string;
  rating: number;
  reviewCount: number;
  address: string;
  website: string;
  phone: string;
}

export interface APIConfig {
  key: string;
}
