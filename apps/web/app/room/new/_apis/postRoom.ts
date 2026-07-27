import { request } from '@/apis/request';
import { RoomMemberStatusT, RoomStatusT } from '@/types/room';

export type PostRoomRequestT = {
  title: string;
  startDate: string;
  endDate: string;
  nights: number | null;
  days: number | null;
  participantCount: number;
  destination: string | null;
};

export type PostRoomResponseT = {
  roomId: string;
  status: RoomStatusT;
  myMemberStatus: RoomMemberStatusT;
  needsScheduleConfirm: boolean;
};

type CreateTripRequest = {
  name: string;
  startRange: string;
  endRange: string;
  durationNights: number | null;
  durationDays: number | null;
  memberCount: number;
  destination: string | null;
};

type CreateTripResponse = Omit<PostRoomResponseT, 'roomId'> & {
  tripId: string;
};

export const postRoom = async (
  requestBody: PostRoomRequestT,
  userId: string,
): Promise<PostRoomResponseT> => {
  const tripRequest: CreateTripRequest = {
    name: requestBody.title,
    startRange: requestBody.startDate,
    endRange: requestBody.endDate,
    durationNights: requestBody.nights,
    durationDays: requestBody.days,
    memberCount: requestBody.participantCount,
    destination: requestBody.destination,
  };

  const tripResponse = await request<CreateTripResponse>(
    `/api/v1/trips?userId=${userId}`,
    {
      method: 'POST',
      data: tripRequest,
    },
  );

  return {
    roomId: tripResponse.tripId,
    status: tripResponse.status,
    myMemberStatus: tripResponse.myMemberStatus,
    needsScheduleConfirm: tripResponse.needsScheduleConfirm,
  };
};
