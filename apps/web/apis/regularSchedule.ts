import { request } from '@/apis/request';

export type DayOfWeekT = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export type ScheduleSlotStatusT = 'POSSIBLE' | 'IMPOSSIBLE';

// 연차·반차·공휴일 필드는 사용자당 1개짜리 별도 리소스(vacation-policy)로 옮겨져
// 이 API의 요청/응답에서 완전히 빠졌다 — apis/vacationPolicy.ts를 대신 사용하라.
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

// "정기 일정이 있나요?" 질문에 "아니요"를 고르면 즉시 호출한다 — 본인 정기 일정을
// 전부 지운다(0건이어도 204, 존재 여부를 먼저 확인할 필요 없음). 개별 일정·연차·
// 휴일 정보는 그대로 남는다.
export const deleteAllRegularSchedules = () =>
  request<void>('/api/v1/users/schedule/regular', {
    method: 'DELETE',
  });
