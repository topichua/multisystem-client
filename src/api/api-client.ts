import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const missingApiUrlError = new Error(
  'VITE_API_URL is not defined. Copy .env.example to .env and set your API URL.',
);

type ApiClientAuthConfig = {
  getAccessToken: () => string | null;
  onUnauthorized: () => void;
};

const defaultAuthConfig: ApiClientAuthConfig = {
  getAccessToken: () => null,
  onUnauthorized: () => undefined,
};

let authConfig = defaultAuthConfig;

export const configureApiClientAuth = (config: ApiClientAuthConfig) => {
  authConfig = config;

  return () => {
    authConfig = defaultAuthConfig;
  };
};

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  if (!API_URL) {
    return Promise.reject(missingApiUrlError);
  }

  const token = authConfig.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authConfig.onUnauthorized();
    }

    return Promise.reject(error);
  },
);
