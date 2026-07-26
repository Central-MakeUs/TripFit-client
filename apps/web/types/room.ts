export type RoomStatusT = 'ONGOING' | 'CONFIRMED' | 'CANCELED' | 'TERMINATED';

export type RoomT = {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  nights: number;
  days: number;
  destination: string;
  hostId: number;
  status: RoomStatusT;
};
