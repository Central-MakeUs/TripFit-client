import { request } from '@/apis/request';

export type VacationApplyPeriodT =
  | 'ANY'
  | 'ONE_WEEK_BEFORE'
  | 'TWO_WEEKS_BEFORE'
  | 'ONE_MONTH_BEFORE';

export type VacationPolicyT = {
  maxVacationDays: number;
  vacationApplyPeriod: VacationApplyPeriodT | null;
  halfVacationAvailable: boolean;
  holidayRest: boolean;
};

export type GetVacationPolicyResponseT = VacationPolicyT;

export const getVacationPolicy = () =>
  request<GetVacationPolicyResponseT>('/api/v1/users/schedule/vacation-policy');

export type PatchVacationPolicyRequestT = VacationPolicyT;
export type PatchVacationPolicyResponseT = VacationPolicyT;

export const patchVacationPolicy = (requestBody: PatchVacationPolicyRequestT) =>
  request<PatchVacationPolicyResponseT>(
    '/api/v1/users/schedule/vacation-policy',
    {
      method: 'PATCH',
      data: requestBody,
    },
  );
