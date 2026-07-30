import { useMutation } from '@tanstack/react-query';

import { RecommendationTypeT } from '@/types/recommendation';

import { postRecommendations } from '../_apis/postRecommendations';

export const usePostRecommendations = () => {
  const {
    mutate: postRecommendationsMutation,
    isPending: isPostRecommendationsPending,
  } = useMutation({
    mutationFn: ({
      roomId,
      type,
    }: {
      roomId: string;
      type: RecommendationTypeT;
    }) => postRecommendations(roomId, type),
  });

  return { postRecommendationsMutation, isPostRecommendationsPending };
};
