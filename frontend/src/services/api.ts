import axios from 'axios';

const TOKEN_KEY = 'luxury_portal_token';

const safeStorage = {
  get item() {
    if (typeof window === 'undefined') return null;
    return localStorage;
  },
};

export const storage = {
  getToken: () => safeStorage.item?.getItem(TOKEN_KEY) ?? null,
  setToken: (token: string) => safeStorage.item?.setItem(TOKEN_KEY, token),
  clearToken: () => safeStorage.item?.removeItem(TOKEN_KEY),
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.clearToken();
    }
    return Promise.reject(error);
  },
);

export default api;
