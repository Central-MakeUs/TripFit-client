import { request } from '@/apis/request';

export type PatchRoomRequestT = {
  title: string;
  memberCount: number;
  nights: number | null;
  days: number | null;
  destination: string | null;
};

type PatchTripRequest = {
  name: string;
  memberCount: number;
  durationNights: number | null;
  durationDays: number | null;
  destination: string | null;
};

export const patchRoom = async ({
  roomId,
  requestBody,
}: {
  roomId: string;
  requestBody: PatchRoomRequestT;
}): Promise<void> => {
  const tripRequest: PatchTripRequest = {
    name: requestBody.title,
    memberCount: requestBody.memberCount,
    durationNights: requestBody.nights,
    durationDays: requestBody.days,
    destination: requestBody.destination,
  };

  await request(`/api/v1/trips/${roomId}`, {
    method: 'PATCH',
    data: tripRequest,
  });
};
