import axios, { AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

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
