import { request } from '@/apis/request';

export type ScheduleSlotStatusT = 'POSSIBLE' | 'IMPOSSIBLE';

export type ScheduleCalendarDayT = {
  date: string;
  morningStatus: ScheduleSlotStatusT;
  afternoonStatus: ScheduleSlotStatusT;
  eveningStatus: ScheduleSlotStatusT;
  uncertain: boolean;
};

export type GetScheduleCalendarRequestT = {
  startDate: string;
  endDate: string;
};

export type GetScheduleCalendarResponseT = {
  startDate: string;
  endDate: string;
  days: ScheduleCalendarDayT[];
};

export const getScheduleCalendar = ({
  startDate,
  endDate,
}: GetScheduleCalendarRequestT) =>
  request<GetScheduleCalendarResponseT>('/api/v1/users/schedule/calendar', {
    method: 'GET',
    params: { startDate, endDate },
  });
