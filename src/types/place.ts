export type Category = 'All' | 'Food' | 'Cafe' | 'Pub' | 'Attraction';

export type Language = 'en' | 'kr' | 'jp' | 'cn';

export interface Place {
  id: string;
  name_en: string;
  name_kr: string;
  category: 'Food' | 'Cafe' | 'Pub' | 'Attraction';
  description_en: string;
  address: string;
  lat: number;
  lng: number;
  recommended_menus: string[];
  image_url: string;
  created_at: string | number;
  opening_hours?: string;
  price_range?: string;
  rating?: number;
  hotel_distance?: string;
  is_featured?: boolean;
}

export interface AdminUser {
  email: string;
  uid: string;
}

export interface HotelInfo {
  name: string;
  address: string;
  lat: number;
  lng: number;
  wifi_name?: string;
  wifi_pass?: string;
}
