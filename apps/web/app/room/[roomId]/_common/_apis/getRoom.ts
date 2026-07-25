import { request } from '@/apis/request';
import { RoomT } from '@/types/room';

export type GetRoomResponseT = RoomT;

type TripDetailResponse = {
  tripId: string;
  name: string;
  destination: string | null;
  startRange: string;
  endRange: string;
  durationDays: number | null;
  durationNights: number | null;
  memberCount: number;
  inviteCode: string;
};

export const getRoom = async (
  roomId: string,
  userId: string,
): Promise<GetRoomResponseT> => {
  const tripResponse = await request<TripDetailResponse>(
    `/api/v1/trips/${roomId}?userId=${userId}`,
  );

  return {
    id: tripResponse.tripId,
    title: tripResponse.name,
    destination: tripResponse.destination ?? '',
    startDate: tripResponse.startRange,
    endDate: tripResponse.endRange,
    nights: tripResponse.durationNights ?? 0,
    days: tripResponse.durationDays ?? 0,
    memberCount: tripResponse.memberCount,
    inviteCode: tripResponse.inviteCode,
  };
};
