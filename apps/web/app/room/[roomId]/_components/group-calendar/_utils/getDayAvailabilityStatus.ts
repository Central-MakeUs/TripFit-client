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
  // 인원 필터에서 특정 참여자를 선택했을 때 그 사람 기준으로만 판단하기 위해 쓴다.
  // 미지정(전체 보기)이면 기존과 동일하게 전체 멤버를 대상으로 계산한다.
  memberId?: string,
): DayAvailabilityStatusT => {
  const dateKey = format(date, 'yyyy-MM-dd');
  const targetMembers = memberId
    ? scheduleCalendar.members.filter((member) => member.id === memberId)
    : scheduleCalendar.members;
  const memberStatuses = targetMembers.map((member) =>
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
