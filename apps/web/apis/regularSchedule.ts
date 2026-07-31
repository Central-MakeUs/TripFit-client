import { request } from '@/apis/request';

export type DayOfWeekT = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export type VacationApplyPeriodT =
  | 'ANY'
  | 'ONE_WEEK_BEFORE'
  | 'TWO_WEEKS_BEFORE'
  | 'ONE_MONTH_BEFORE';

export type ScheduleSlotStatusT = 'POSSIBLE' | 'IMPOSSIBLE';

export type RegularScheduleItemT = {
  id: string;
  title: string;
  // 콤마로 구분된 Weekday CSV, 예: "MON,TUE,WED"
  daysOfWeek: string;
  startTime: string;
  endTime: string;
  morningStatus: ScheduleSlotStatusT;
  afternoonStatus: ScheduleSlotStatusT;
  eveningStatus: ScheduleSlotStatusT;
  maxVacationDays: number;
  vacationApplyPeriod: VacationApplyPeriodT;
  halfVacationAvailable: boolean;
  holidayRest: boolean;
};

export type GetRegularSchedulesResponseT = {
  items: RegularScheduleItemT[];
};

export const getRegularSchedules = () =>
  request<GetRegularSchedulesResponseT>('/api/v1/users/schedule/regular');

export type RegularScheduleRequestBodyT = {
  title: string;
  daysOfWeek: string;
  startTime: string;
  endTime: string;
  maxVacationDays: number;
  vacationApplyPeriod: VacationApplyPeriodT;
  halfVacationAvailable: boolean;
  holidayRest: boolean;
};

export type PostRegularScheduleRequestT = RegularScheduleRequestBodyT;
export type PostRegularScheduleResponseT = RegularScheduleItemT;

export const postRegularSchedule = (requestBody: PostRegularScheduleRequestT) =>
  request<PostRegularScheduleResponseT>('/api/v1/users/schedule/regular', {
    method: 'POST',
    data: requestBody,
  });

export type PatchRegularScheduleRequestT = RegularScheduleRequestBodyT & {
  id: string;
};
export type PatchRegularScheduleResponseT = RegularScheduleItemT;

export const patchRegularSchedule = ({
  id,
  ...requestBody
}: PatchRegularScheduleRequestT) =>
  request<PatchRegularScheduleResponseT>(
    `/api/v1/users/schedule/regular/${id}`,
    {
      method: 'PATCH',
      data: requestBody,
    },
  );

export const deleteRegularSchedule = (id: string) =>
  request<void>(`/api/v1/users/schedule/regular/${id}`, {
    method: 'DELETE',
  });
