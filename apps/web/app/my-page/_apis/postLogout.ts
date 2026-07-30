import { request } from '@/apis/request';

export type PostLogoutRequestT = {
  refreshToken: string;
};

export const postLogout = (requestBody: PostLogoutRequestT) =>
  request<void>('/api/v1/auth/logout', {
    method: 'POST',
    data: requestBody,
  });
