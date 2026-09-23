import axiosInstance from '@/lib/axios';
import type { LoginCredentials, LoginResponse } from '@/types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  async getCurrentUser(token: string): Promise<LoginResponse> {
    const response = await axiosInstance.get<LoginResponse>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};