import { request } from '@/apis/request';
import { RecommendationFeedbackReasonT } from '@/types/recommendation';

export type PatchRecommendationFeedbackRequestT = {
  roomId: string;
  rank: number;
  status: 'HELPFUL' | 'NOT_HELPFUL';
  reason?: RecommendationFeedbackReasonT;
  reasonDetail?: string;
};

export const patchRecommendationFeedback = async ({
  roomId,
  rank,
  status,
  reason,
  reasonDetail,
}: PatchRecommendationFeedbackRequestT): Promise<void> => {
  await request(`/api/v1/trips/${roomId}/recommendations/${rank}/feedback`, {
    method: 'PATCH',
    data: { status, reason, reasonDetail },
  });
};
