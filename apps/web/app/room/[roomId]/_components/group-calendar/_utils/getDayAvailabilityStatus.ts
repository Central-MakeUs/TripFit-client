import { format } from 'date-fns';

import {
  GetRoomScheduleCalendarResponseT,
  RoomScheduleMemberT,
} from '../_apis/getRoomScheduleCalendar';
import { DayAvailabilityStatusT } from '../_consts/groupCalendar.const';

export type MemberDateStatusT =
  | 'possible'
  | 'partial'
  | 'impossible'
  | 'uncertain';

export const getMemberDateStatus = (
  member: RoomScheduleMemberT,
  dateKey: string,
): MemberDateStatusT => {
  const day = member.days.find((memberDay) => memberDay.date === dateKey);
  if (!day) return 'possible';
  if (day.uncertain) return 'uncertain';

  const slots = [day.morningStatus, day.afternoonStatus, day.eveningStatus];
  if (slots.every((slot) => slot === 'POSSIBLE')) return 'possible';
  if (slots.every((slot) => slot === 'IMPOSSIBLE')) return 'impossible';
  return 'partial';
};

export const getDayAvailabilityStatus = (
  scheduleCalendar: GetRoomScheduleCalendarResponseT,
  date: Date,
): DayAvailabilityStatusT => {
  const dateKey = format(date, 'yyyy-MM-dd');
  const memberStatuses = scheduleCalendar.members.map((member) =>
    getMemberDateStatus(member, dateKey),
  );

  if (memberStatuses.every((status) => status === 'possible')) {
    return 'available';
  }
  if (memberStatuses.every((status) => status === 'impossible')) {
    return 'unavailable';
  }
  return 'partial';
};
