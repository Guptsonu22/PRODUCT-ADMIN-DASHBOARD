import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authUtils } from '@/lib/auth';

// Single shared Axios instance. Base URL comes from env so it is not hardcoded.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dummyjson.com';

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request. Token lives only in lib/auth (single source).
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authUtils.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Central place for auth errors. Any 401 clears local auth and goes to login.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      authUtils.clearAuth();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;