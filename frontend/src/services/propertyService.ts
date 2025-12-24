import api from './api';
import { ApiResponse, Property } from '../types';

export const propertyService = {
  async list() {
    const { data } = await api.get<ApiResponse<Property[]>>('/properties');
    return data.data ?? [];
  },
  async getById(id: string) {
    const { data } = await api.get<ApiResponse<Property>>(`/properties/${id}`);
    return data.data;
  },
  async create(payload: Partial<Property>) {
    const { data } = await api.post<ApiResponse<Property>>('/properties', payload);
    return data.data;
  },
};
