export interface Business {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
  rating: number;
  reviewCount: number;
  place_id: string;
  location: {
    lat: number;
    lng: number;
  };
  photos?: string[];
  inLeads?: boolean;
}

export interface Lead {
  id: string;
  business_id: string;
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
  rating: number;
  review_count: number;
  status: 'Lead' | 'Contatado' | 'Reunião Agendada' | 'Proposta Enviada' | 'Fechado' | 'Perdido';
  comments: Comment[];
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  lead_id: string;
  content: string;
  created_at: string;
  user_id: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  google_api_key: string;
  dark_mode: boolean;
  search_radius_km: number;
  default_location: {
    lat: number;
    lng: number;
  };
}

export interface SearchHistory {
  id: string;
  user_id: string;
  query: string;
  results_count: number;
  created_at: string;
}
