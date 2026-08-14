import { request } from '@/apis/request';

export type PostLogoutRequestT = {
  refreshToken: string;
  // 넣으면 만료 전이라도 이 access token을 즉시 무효화함 — 없어도 로그아웃 자체는 성공
  accessToken?: string;
};

export const postLogout = (requestBody: PostLogoutRequestT) =>
  request<void>('/api/v1/auth/logout', {
    method: 'POST',
    data: requestBody,
  });
