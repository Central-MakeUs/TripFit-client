import { request } from '@/apis/request';
import { RecommendationUnconfirmReasonT } from '@/types/recommendation';

export type PostUnconfirmTripRequestT = {
  roomId: string;
  reason: RecommendationUnconfirmReasonT;
  reasonDetail?: string;
};

export const postUnconfirmTrip = async ({
  roomId,
  reason,
  reasonDetail,
}: PostUnconfirmTripRequestT): Promise<void> => {
  await request(`/api/v1/trips/${roomId}/unconfirm`, {
    method: 'POST',
    data: { reason, reasonDetail },
  });
};
