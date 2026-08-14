import { useMutation } from '@tanstack/react-query';

import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

import { postTripsJoinHold } from '../_apis/postTripsJoinHold';

export const usePostTripsJoinHold = () => {
  const mutationFn = useAuthenticatedMutationFn(postTripsJoinHold);

  const {
    mutateAsync: postTripsJoinHoldMutation,
    isPending: isPostTripsJoinHoldPending,
  } = useMutation({ mutationFn });

  return { postTripsJoinHoldMutation, isPostTripsJoinHoldPending };
};
