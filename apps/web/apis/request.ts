import axios, { AxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// accessToken 만료(401) 시 refreshToken으로 한 번만 재발급을 시도하고 원래 요청을 재시도한다.
// 재발급 요청 자체는 apiClient를 직접 호출해 이 인터셉터를 다시 타지 않게 한다(무한 재귀 방지).
// 동시에 여러 요청이 401을 받아도 재발급은 한 번만 일어나도록 진행 중인 Promise를 공유한다.
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = (): Promise<string> => {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return Promise.reject(new Error('로그인이 필요합니다.'));

  if (!refreshPromise) {
    refreshPromise = apiClient
      .post<{ data: { accessToken: string } }>('/api/v1/auth/refresh', {
        refreshToken,
      })
      .then((response) => {
        const { accessToken } = response.data.data;
        useAuthStore.getState().setAccessToken(accessToken);
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

type RetriableConfig = AxiosRequestConfig & { _retried?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error) || !error.response || !error.config) {
      throw error;
    }

    const originalRequest = error.config as RetriableConfig;
    const isAuthEndpoint = originalRequest.url?.startsWith('/api/v1/auth/');

    if (
      error.response.status === 401 &&
      !originalRequest._retried &&
      !isAuthEndpoint
    ) {
      originalRequest._retried = true;
      try {
        const accessToken = await refreshAccessToken();
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${accessToken}`,
        };
        return apiClient.request(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clear();
        throw refreshError;
      }
    }

    throw error;
  },
);

type RequestConfig = Omit<
  AxiosRequestConfig,
  'url' | 'baseURL' | 'validateStatus'
>;

export async function request<T>(
  path: string,
  config?: RequestConfig,
): Promise<T> {
  try {
    const response = await apiClient.request<{ data: T }>({
      ...config,
      url: path,
    });
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const body = error.response.data;
      const message =
        typeof body === 'object' && body !== null
          ? (body as { message?: string }).message
          : undefined;
      throw new Error(message || '요청 처리 중 오류가 발생했습니다.');
    }
    throw new Error('서버 응답을 해석할 수 없습니다.');
  }
}
