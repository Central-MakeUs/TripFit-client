import { useMutation } from '@tanstack/react-query';

import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';
import { RecommendationTypeT } from '@/types/recommendation';

import { postRecommendations } from '../_apis/postRecommendations';

export const usePostRecommendations = () => {
  const mutationFn = useAuthenticatedMutationFn(
    ({ roomId, type }: { roomId: string; type: RecommendationTypeT }) =>
      postRecommendations(roomId, type),
  );

  const {
    mutate: postRecommendationsMutation,
    isPending: isPostRecommendationsPending,
  } = useMutation({ mutationFn });

  return { postRecommendationsMutation, isPostRecommendationsPending };
};
