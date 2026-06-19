import { apiClient } from "@/api/api-client";

import type { AuthSessionResponse } from "@/features/auth/model/auth-session.types";

export type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  access_token: string;
};

export type UpdateAuthProfileRequest = {
  firstName: string;
  lastName: string;
  phone?: string;
};

function axiosMultipartFormDataConfig() {
  return {
    transformRequest: [
      (body: unknown, headers: object) => {
        if (body instanceof FormData && headers) {
          if (
            typeof (headers as { delete?: (name: string) => void }).delete ===
            "function"
          ) {
            (headers as { delete: (name: string) => void }).delete(
              "Content-Type",
            );
          } else {
            delete (headers as Record<string, unknown>)["Content-Type"];
          }
        }
        return body;
      },
    ],
  };
}

export const authApi = {
  login: async (payload: LoginRequest) => {
    const { data } = await apiClient.post<LoginResponse>(
      "/auth/login",
      payload,
    );

    return data;
  },

  getSession: async () => {
    const { data } = await apiClient.get<AuthSessionResponse>("/auth");

    return data;
  },

  updateProfile: async (payload: UpdateAuthProfileRequest) => {
    const { data } = await apiClient.patch<AuthSessionResponse>(
      "/auth/profile",
      payload,
    );

    return data;
  },

  updateAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file, file.name);

    const { data } = await apiClient.put<AuthSessionResponse>(
      "/auth/avatar",
      formData,
      axiosMultipartFormDataConfig(),
    );

    return data;
  },
};
