import { useMutation } from '@tanstack/react-query';

import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

import { getRecommendationDetail } from '../_apis/getRecommendationDetail';

export const useGetRecommendationDetail = () => {
  const mutationFn = useAuthenticatedMutationFn(
    ({
      roomId,
      rank,
      myName,
    }: {
      roomId: string;
      rank: number;
      myName: string;
    }) => getRecommendationDetail(roomId, rank, myName),
  );

  const {
    mutate: getRecommendationDetailMutation,
    isPending: isGetRecommendationDetailPending,
  } = useMutation({ mutationFn });

  return { getRecommendationDetailMutation, isGetRecommendationDetailPending };
};
