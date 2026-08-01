export type RoomStatusT = 'ONGOING' | 'CONFIRMED' | 'EXPIRED';
export type RoomMemberStatusT = 'SCHEDULE_PENDING' | 'ACTIVE';

export type MemberPreviewT = {
  displayName: string;
  profileImageUrl: string | null;
  role: 'OWNER' | 'MEMBER';
  userId: string;
};

export type RoomT = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  nights: number | null;
  days: number | null;
  destination: string;
  memberCount: number;
  activeMemberCount: number;
  inviteCode: string;
  status: RoomStatusT;
  isHost: boolean;
  confirmedStartDate: string | null;
  confirmedEndDate: string | null;
  confirmedAttendCount: number | null;
  confirmedVacationMemberCount: number | null;
  confirmedUncertainCount: number | null;
};
