export type RoomStatusT = 'ONGOING' | 'CONFIRMED' | 'EXPIRED';
export type RoomMemberStatusT = 'SCHEDULE_PENDING' | 'ACTIVE';

export type RoomT = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  nights: number;
  days: number;
  destination: string;
  memberCount: number;
  inviteCode: string;
  status: RoomStatusT;
  confirmedStartDate: string | null;
  confirmedEndDate: string | null;
  confirmedAttendCount: number | null;
  confirmedVacationMemberCount: number | null;
  confirmedUncertainCount: number | null;
};
