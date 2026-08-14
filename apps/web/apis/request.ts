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

type RequestConfig = Omit<
  AxiosRequestConfig,
  'url' | 'baseURL' | 'validateStatus'
>;

export class ApiError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function request<T>(
  path: string,
  config?: RequestConfig,
): Promise<T> {
  try {
    const response = await apiClient.request<{ data: T }>({
      ...config,
      url: path,
    });
    // 204 No Content 등 body가 없는 응답에서는 response.data 자체가 비어있을 수 있다
    return response.data?.data as T;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const body = error.response.data;
      const { message, code } =
        typeof body === 'object' && body !== null
          ? (body as { message?: string; code?: string })
          : { message: undefined, code: undefined };
      throw new ApiError(
        message || '요청 처리 중 오류가 발생했습니다.',
        code,
        error.response.status,
      );
    }
    throw new ApiError('서버 응답을 해석할 수 없습니다.');
  }
}

// accessToken 만료(401) 시 refreshToken으로 한 번만 재발급을 시도하고 원래 요청을 재시도한다.
// 동시에 여러 요청이 401을 받아도 재발급은 한 번만 일어나도록 진행 중인 Promise를 공유한다.
// /api/v1/auth/로 시작하는 요청은 아래 401 인터셉터가 재시도 대상에서 제외하므로,
// 이 요청이 다시 401을 받아도 재귀적으로 재발급을 또 시도하지 않는다.
let refreshPromise: Promise<string> | null = null;

type RefreshAccessTokenResponseT = {
  accessToken: string;
  refreshToken: string;
};

const refreshAccessToken = (): Promise<string> => {
  const { refreshToken } = useAuthStore.getState();
  // refreshToken이 없으면 재발급이 애초에 불가능한, 확실한 인증 실패 상황이다.
  // 일반 Error로 던지면 아래 401/403 판별(instanceof ApiError)을 통과하지 못해 로그아웃
  // 처리가 되지 않고 조용히 실패만 반복되므로, 같은 경로를 타도록 ApiError(401)로 던진다.
  if (!refreshToken) {
    return Promise.reject(new ApiError('로그인이 필요합니다.', undefined, 401));
  }

  if (!refreshPromise) {
    refreshPromise = request<RefreshAccessTokenResponseT>(
      '/api/v1/auth/refresh',
      {
        method: 'POST',
        data: { refreshToken },
      },
    )
      .then(({ accessToken, refreshToken: nextRefreshToken }) => {
        // 서버가 호출마다 refresh token을 회전시키고 기존 값은 그 즉시 폐기하므로,
        // 반드시 이 응답의 새 값으로 교체해야 다음 재발급이 실패하지 않는다.
        useAuthStore.getState().setAccessToken(accessToken);
        useAuthStore.getState().setRefreshToken(nextRefreshToken);
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
        // refresh 자체가 인증 실패(401/403)로 거부된 경우에만 로그아웃 처리한다 —
        // 네트워크 오류/타임아웃 등으로 재발급에 실패한 경우까지 로그아웃시키면
        // 일시적인 연결 문제로도 세션이 강제로 끊기게 된다. 이미 폐기된(회전된)
        // refresh token 재사용 시 서버가 내려주는 AUTH_REFRESH_REUSE(401, 탈취
        // 의심 시나리오)도 이 401 분기로 자연스럽게 포함되어 전체 로그인 체인이
        // 폐기된다.
        if (
          refreshError instanceof ApiError &&
          (refreshError.status === 401 || refreshError.status === 403)
        ) {
          useAuthStore.getState().clear();
        }
        throw refreshError;
      }
    }

    throw error;
  },
);
