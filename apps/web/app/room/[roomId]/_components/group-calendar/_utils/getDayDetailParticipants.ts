import { format } from 'date-fns';

import { ParticipantT } from '@/types/participant';

import { ParticipantStatusT } from '../../../_common/_types/participantStatus';
import {
  GetRoomScheduleCalendarResponseT,
  RoomScheduleDayT,
  RoomScheduleMemberT,
} from '../_apis/getRoomScheduleCalendar';
import { getMemberDateStatus } from './getDayAvailabilityStatus';

type DayDetailParticipantsT = {
  needsAttention: ParticipantStatusT[];
  available: ParticipantStatusT[];
};

const getUncertainDayCount = (member: RoomScheduleMemberT) =>
  member.days.filter((day) => day.uncertain).length;

// 불가능한 시간대만 모아 "불가능(오전, 오후)"처럼 조합한다 — 세 시간대가 모두
// 불가능한 경우엔 "불가능(오전, 오후, 저녁)" 대신 "불가능(종일)"로 줄인다.
const buildImpossibleLabel = (day: RoomScheduleDayT): string => {
  const impossibleSlotLabels: string[] = [];
  if (day.morningStatus === 'IMPOSSIBLE') impossibleSlotLabels.push('오전');
  if (day.afternoonStatus === 'IMPOSSIBLE') impossibleSlotLabels.push('오후');
  if (day.eveningStatus === 'IMPOSSIBLE') impossibleSlotLabels.push('저녁');

  if (impossibleSlotLabels.length === 3) return '불가능(종일)';
  return `불가능(${impossibleSlotLabels.join(', ')})`;
};

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
      // 불가능/부분 불가능 둘 다 "어느 시간대가 불가능한지"를 구체적으로 밝힌다 —
      // '연차 필요'/'부분 참석'이라는 별도 라벨은 이 화면에 두지 않는다.
      if (status === 'impossible' || status === 'partial') {
        const day = member.days.find((memberDay) => memberDay.date === dateKey);
        if (day) {
          acc.needsAttention.push(
            toParticipantStatus(member, { label: buildImpossibleLabel(day) }),
          );
        }
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
