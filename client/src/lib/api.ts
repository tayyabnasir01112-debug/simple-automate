import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

let inMemoryToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('sa_access') : null;

export const setAccessToken = (token: string | null) => {
  inMemoryToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('sa_access', token);
    } else {
      localStorage.removeItem('sa_access');
    }
  }
};

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const refreshAccessToken = async () => {
  const response = await axios.post(
    `${API_URL}/auth/refresh`,
    {},
    {
      withCredentials: true,
    },
  );
  return response.data.accessToken as string;
};

api.interceptors.request.use((config) => {
  if (inMemoryToken) {
    config.headers.Authorization = `Bearer ${inMemoryToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

