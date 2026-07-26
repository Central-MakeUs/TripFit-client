export type RoomStatusT = 'ONGOING' | 'CONFIRMED' | 'CANCELED' | 'TERMINATED';

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
