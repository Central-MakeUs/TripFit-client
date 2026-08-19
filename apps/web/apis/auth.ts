import { request } from '@/apis/request';
import { SocialProviderT, UserSummaryT } from '@/types/auth';

export type PostAuthLoginRequestT = {
  provider: SocialProviderT;
  token: string;
  authorizationCode?: string;
  redirectUri?: string;
};

export type PostAuthLoginResponseT = {
  accessToken: string;
  // refreshToken은 응답 바디가 아니라 서버가 Set-Cookie(HttpOnly)로 내려준다 — 이
  // 필드는 존재하지 않는다.
  expiresIn: number;
  user: UserSummaryT;
};

export const postAuthLogin = (requestBody: PostAuthLoginRequestT) =>
  request<PostAuthLoginResponseT>('/api/v1/auth/login', {
    method: 'POST',
    data: requestBody,
  });

export type GetAuthMeResponseT = UserSummaryT;

export const getAuthMe = () => request<GetAuthMeResponseT>('/api/v1/auth/me');
