import api from './api';
import { ApiResponse, User } from '../types';

interface Analytics {
  properties: {
    total: number;
    active: number;
    pending: number;
  };
  bookings: {
    total: number;
    revenue: number;
    pending: number;
    confirmed: number;
  };
  payments: {
    total: number;
    completed: number;
    completedAmount: number;
    pending: number;
    pendingAmount: number;
    failed: number;
  };
  users: {
    total: number;
    breakdown: Record<string, number>;
  };
}

export const adminService = {
  async listUsers() {
    const { data } = await api.get<ApiResponse<User[]>>('/admin/users');
    return data.data ?? [];
  },
  async analytics() {
    const { data } = await api.get<ApiResponse<Analytics>>('/admin/analytics');
    return data.data;
  },
};
