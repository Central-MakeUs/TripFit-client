import { request } from '@/apis/request';
import { SocialProviderT, UserSummaryT } from '@/types/auth';

export type PostAuthLoginRequestT = {
  provider: SocialProviderT;
  token: string;
  authorizationCode?: string;
};

export type PostAuthLoginResponseT = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserSummaryT;
};

export const postAuthLogin = (requestBody: PostAuthLoginRequestT) =>
  request<PostAuthLoginResponseT>('/api/v1/auth/login', {
    method: 'POST',
    data: requestBody,
  });
