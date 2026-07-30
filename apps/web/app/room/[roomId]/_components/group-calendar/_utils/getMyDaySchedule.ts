import { format } from 'date-fns';

import { DayScheduleValueT } from '@/types/schedule';

import { GetRoomScheduleCalendarResponseT } from '../_apis/getRoomScheduleCalendar';

export const DEFAULT_DAY_SCHEDULE_VALUE: DayScheduleValueT = {
  isUncertain: false,
  morning: 'available',
  afternoon: 'available',
  evening: 'available',
};

export const getMyDaySchedule = (
  scheduleCalendar: GetRoomScheduleCalendarResponseT,
  date: Date,
): DayScheduleValueT => {
  const dateKey = format(date, 'yyyy-MM-dd');
  const me = scheduleCalendar.members.find((member) => member.isMe);
  const day = me?.days.find((memberDay) => memberDay.date === dateKey);

  if (!day) return DEFAULT_DAY_SCHEDULE_VALUE;

  return {
    isUncertain: day.uncertain,
    morning: day.morningStatus === 'POSSIBLE' ? 'available' : 'unavailable',
    afternoon: day.afternoonStatus === 'POSSIBLE' ? 'available' : 'unavailable',
    evening: day.eveningStatus === 'POSSIBLE' ? 'available' : 'unavailable',
  };
};
