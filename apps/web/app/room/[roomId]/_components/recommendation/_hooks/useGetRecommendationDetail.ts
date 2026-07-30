import { useMutation } from '@tanstack/react-query';

import { getRecommendationDetail } from '../_apis/getRecommendationDetail';

export const useGetRecommendationDetail = () => {
  const {
    mutate: getRecommendationDetailMutation,
    isPending: isGetRecommendationDetailPending,
  } = useMutation({
    mutationFn: ({
      roomId,
      rank,
      myName,
    }: {
      roomId: string;
      rank: number;
      myName: string;
    }) => getRecommendationDetail(roomId, rank, myName),
  });

  return { getRecommendationDetailMutation, isGetRecommendationDetailPending };
};
