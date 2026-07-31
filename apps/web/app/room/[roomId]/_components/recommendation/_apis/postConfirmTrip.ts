import { request } from '@/apis/request';

export type PostConfirmTripRequestT = {
  roomId: string;
  recommendationRank: number;
};

export const postConfirmTrip = async ({
  roomId,
  recommendationRank,
}: PostConfirmTripRequestT): Promise<void> => {
  await request(`/api/v1/trips/${roomId}/confirm`, {
    method: 'POST',
    data: { recommendationRank, startDate: null, endDate: null },
  });
};
