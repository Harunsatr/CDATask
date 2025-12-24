import api from './api';
import { ApiResponse, Booking } from '../types';

export interface CreateBookingPayload {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests?: string;
}

export interface CheckAvailabilityResponse {
  available: boolean;
  property: {
    id: string;
    name: string;
    pricePerNight: number;
    currency: string;
  };
  nights: number;
  totalPrice: number;
}

export const bookingService = {
  async list(status?: string) {
    const params = status ? `?status=${status}` : '';
    const { data } = await api.get<ApiResponse<Booking[]>>(`/bookings${params}`);
    return data.data ?? [];
  },

  async getById(id: string) {
    const { data } = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return data.data;
  },

  async create(payload: CreateBookingPayload) {
    const { data } = await api.post<ApiResponse<Booking>>('/bookings', payload);
    return data.data;
  },

  async cancel(id: string) {
    const { data } = await api.post<ApiResponse<Booking>>(`/bookings/${id}/cancel`);
    return data.data;
  },

  async checkAvailability(propertyId: string, checkIn: string, checkOut: string) {
    const { data } = await api.get<ApiResponse<CheckAvailabilityResponse>>(
      `/bookings/check-availability?propertyId=${propertyId}&checkIn=${checkIn}&checkOut=${checkOut}`
    );
    return data.data;
  },
};
