import { request } from '@/apis/request';
import { RoomMemberStatusT } from '@/types/room';

export type ScheduleSlotStatusT = 'POSSIBLE' | 'IMPOSSIBLE';

export type RoomScheduleDayT = {
  date: string;
  morningStatus: ScheduleSlotStatusT;
  afternoonStatus: ScheduleSlotStatusT;
  eveningStatus: ScheduleSlotStatusT;
  uncertain: boolean;
};

export type RoomScheduleMemberT = {
  id: string;
  name: string;
  isHost: boolean;
  isMe: boolean;
  days: RoomScheduleDayT[];
};

export type GetRoomScheduleCalendarResponseT = {
  startDate: string;
  endDate: string;
  readOnly: boolean;
  members: RoomScheduleMemberT[];
};

type ScheduleCalendarMemberResponse = {
  userId: string;
  displayName: string;
  role: 'OWNER' | 'MEMBER';
  memberStatus: RoomMemberStatusT;
  days: {
    date: string;
    morningStatus: ScheduleSlotStatusT;
    afternoonStatus: ScheduleSlotStatusT;
    eveningStatus: ScheduleSlotStatusT;
    uncertain: boolean;
  }[];
};

type ScheduleCalendarResponse = {
  startDate: string;
  endDate: string;
  readOnly: boolean;
  members: ScheduleCalendarMemberResponse[];
};

export const getRoomScheduleCalendar = async (
  roomId: string,
  userId: string,
): Promise<GetRoomScheduleCalendarResponseT> => {
  const scheduleCalendarResponse = await request<ScheduleCalendarResponse>(
    `/api/v1/trips/${roomId}/members/schedule-calendar?userId=${userId}`,
  );

  return {
    startDate: scheduleCalendarResponse.startDate,
    endDate: scheduleCalendarResponse.endDate,
    readOnly: scheduleCalendarResponse.readOnly,
    members: scheduleCalendarResponse.members.map((member) => ({
      id: member.userId,
      name: member.displayName,
      isHost: member.role === 'OWNER',
      isMe: member.userId === userId,
      days: member.days.map((day) => ({
        date: day.date,
        morningStatus: day.morningStatus,
        afternoonStatus: day.afternoonStatus,
        eveningStatus: day.eveningStatus,
        uncertain: day.uncertain,
      })),
    })),
  };
};
