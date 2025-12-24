import api from './api';
import { ApiResponse } from '../types';

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'refund_pending' | 'refunded';
  transaction_id: string | null;
  created_at: string;
  property_name?: string;
}

export interface ProcessPaymentPayload {
  method: 'credit_card' | 'paypal' | 'bank_transfer' | 'stripe' | 'free';
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardName?: string;
  paypalEmail?: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };
}

export interface PaymentResult {
  success: boolean;
  message: string;
  data: Payment;
}

export const paymentService = {
  async getMethods() {
    const { data } = await api.get<ApiResponse<PaymentMethod[]>>('/payments/methods');
    return data.data ?? [];
  },

  async processPayment(bookingId: string, payload: ProcessPaymentPayload) {
    const { data } = await api.post<PaymentResult>(`/bookings/${bookingId}/pay`, payload);
    return data;
  },

  async getPayments() {
    const { data } = await api.get<ApiResponse<Payment[]>>('/payments');
    return data.data ?? [];
  },

  async getPaymentById(id: string) {
    const { data } = await api.get<ApiResponse<Payment>>(`/payments/${id}`);
    return data.data;
  },

  async requestRefund(paymentId: string, reason: string) {
    const { data } = await api.post<ApiResponse<Payment>>(`/payments/${paymentId}/refund`, { reason });
    return data.data;
  },
};
