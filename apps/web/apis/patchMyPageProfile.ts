import { request } from '@/apis/request';
import { UserSummaryT } from '@/types/auth';

export type PatchMyPageProfileRequestT = {
  firstName?: string;
  lastName?: string;
  notificationEnabled?: boolean;
};

export type PatchMyPageProfileResponseT = UserSummaryT;

export const patchMyPageProfile = (requestBody: PatchMyPageProfileRequestT) =>
  request<PatchMyPageProfileResponseT>('/api/v1/users/profile', {
    method: 'PATCH',
    data: requestBody,
  });
