import { format } from 'date-fns';

import { ParticipantT } from '@/types/participant';

import { ParticipantStatusT } from '../../../_common/_types/participantStatus';
import {
  GetRoomScheduleCalendarResponseT,
  RoomScheduleMemberT,
} from '../_apis/getRoomScheduleCalendar';
import { getMemberDateStatus } from './getDayAvailabilityStatus';

type DayDetailParticipantsT = {
  needsAttention: ParticipantStatusT[];
  available: ParticipantStatusT[];
};

const getUncertainDayCount = (member: RoomScheduleMemberT) =>
  member.days.filter((day) => day.uncertain).length;

export const getDayDetailParticipants = (
  scheduleCalendar: GetRoomScheduleCalendarResponseT,
  participants: ParticipantT[],
  date: Date,
): DayDetailParticipantsT => {
  const dateKey = format(date, 'yyyy-MM-dd');

  const toParticipantStatus = (
    member: RoomScheduleMemberT,
    reason: ParticipantStatusT['reason'],
  ): ParticipantStatusT => {
    const participant = participants.find((p) => p.id === member.id);
    return {
      name: member.name,
      isHost: member.isHost,
      isMe: member.isMe,
      reason,
      color: participant?.color ?? 'pink',
      tone: participant?.tone,
    };
  };

  return scheduleCalendar.members.reduce<DayDetailParticipantsT>(
    (acc, member) => {
      const status = getMemberDateStatus(member, dateKey);

      if (status === 'possible') {
        acc.available.push(toParticipantStatus(member, { label: '정상 참석' }));
        return acc;
      }
      if (status === 'impossible') {
        acc.needsAttention.push(
          toParticipantStatus(member, { label: '불가능' }),
        );
        return acc;
      }
      if (status === 'partial') {
        acc.needsAttention.push(
          toParticipantStatus(member, { label: '부분 참여' }),
        );
        return acc;
      }
      acc.needsAttention.push(
        toParticipantStatus(member, {
          label: '불확실 일정',
          days: getUncertainDayCount(member),
        }),
      );
      return acc;
    },
    { needsAttention: [], available: [] },
  );
};
