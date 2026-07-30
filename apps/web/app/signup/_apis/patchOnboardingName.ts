import { request } from '@/apis/request';
import { UserSummaryT } from '@/types/auth';

export type PatchOnboardingNameRequestT = {
  firstName: string;
  lastName: string;
};

export type PatchOnboardingNameResponseT = UserSummaryT;

export const patchOnboardingName = (requestBody: PatchOnboardingNameRequestT) =>
  request<PatchOnboardingNameResponseT>('/api/v1/users/onboarding/name', {
    method: 'PATCH',
    data: requestBody,
  });
