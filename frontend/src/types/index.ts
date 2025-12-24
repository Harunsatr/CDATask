export type Role = 'customer' | 'merchant' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatar?: string;
  created_at?: string;
}

export interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  address?: string;
  price_per_night: number;
  currency?: string;
  rating?: number;
  review_count?: number;
  bedrooms?: number;
  bathrooms?: number;
  max_guests: number;
  images: string[];
  amenities: string[];
  merchant_id?: string;
  status?: 'pending' | 'active' | 'inactive' | 'rejected' | 'approved';
}

export interface Booking {
  id: string;
  property_id: string;
  user_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  payment_id?: string;
  payment_method?: string;
  special_requests?: string;
  property_name?: string;
  property_location?: string;
  property_images?: string[];
  user_name?: string;
  user_email?: string;
  created_at?: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'refund_pending' | 'refunded';
  transaction_id?: string;
  created_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: User;
}
