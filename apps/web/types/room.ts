export type RoomStatusT = 'ONGOING' | 'CONFIRMED' | 'EXPIRED';
export type RoomMemberStatusT = 'JOINED' | 'RESPONDED';

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
};
