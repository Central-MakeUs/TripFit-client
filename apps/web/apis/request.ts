import axios, { AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// TODO: 로그인 유저 전역 상태 도입 후 실제 토큰으로 교체
// NODE_ENV 분기는 프로덕션 빌드 시 정적으로 제거되어, 토큰 참조를 포함한 이 블록 전체가 번들에 포함되지 않는다
if (process.env.NODE_ENV !== 'production') {
  apiClient.interceptors.request.use((config) => {
    const tempJwt = process.env.NEXT_PUBLIC_TEMP_JWT;
    if (tempJwt) {
      config.headers.Authorization = `Bearer ${tempJwt}`;
    }
    return config;
  });
}

type RequestConfig = Omit<
  AxiosRequestConfig,
  'url' | 'baseURL' | 'validateStatus'
>;

export class ApiError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
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
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const body = error.response.data;
      const { message, code } =
        typeof body === 'object' && body !== null
          ? (body as { message?: string; code?: string })
          : { message: undefined, code: undefined };
      throw new ApiError(message || '요청 처리 중 오류가 발생했습니다.', code);
    }
    throw new ApiError('서버 응답을 해석할 수 없습니다.');
  }
}
