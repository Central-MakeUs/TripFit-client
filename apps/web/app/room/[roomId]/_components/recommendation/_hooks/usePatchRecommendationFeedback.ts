import { useMutation } from '@tanstack/react-query';

import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

import { patchRecommendationFeedback } from '../_apis/patchRecommendationFeedback';

export const usePatchRecommendationFeedback = () => {
  const mutationFn = useAuthenticatedMutationFn(patchRecommendationFeedback);

  const {
    mutate: patchRecommendationFeedbackMutation,
    isPending: isPatchRecommendationFeedbackPending,
  } = useMutation({ mutationFn });

  return {
    patchRecommendationFeedbackMutation,
    isPatchRecommendationFeedbackPending,
  };
};
