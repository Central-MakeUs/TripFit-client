import { useMutation } from '@tanstack/react-query';

import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

import { deleteTripsJoinHold } from '../_apis/deleteTripsJoinHold';

export const useDeleteTripsJoinHold = () => {
  const mutationFn = useAuthenticatedMutationFn(deleteTripsJoinHold);

  const {
    mutate: deleteTripsJoinHoldMutation,
    isPending: isDeleteTripsJoinHoldPending,
  } = useMutation({ mutationFn });

  return { deleteTripsJoinHoldMutation, isDeleteTripsJoinHoldPending };
};
