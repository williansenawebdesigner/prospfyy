export interface Business {
  name: string;
  rating: number;
  reviewCount: number;
  address: string;
  website: string;
  phone: string;
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