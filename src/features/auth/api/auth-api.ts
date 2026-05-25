import { apiClient } from '@/api/api-client';

import type { AuthSessionResponse } from '@/features/auth/model/auth-session.types';

export type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  access_token: string;
};

export const authApi = {
  login: async (payload: LoginRequest) => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);

    return data;
  },

  getSession: async () => {
    const { data } = await apiClient.get<AuthSessionResponse>('/auth');

    return data;
  },
};
