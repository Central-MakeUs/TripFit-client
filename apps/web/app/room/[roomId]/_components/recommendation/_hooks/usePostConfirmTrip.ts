import { useMutation } from '@tanstack/react-query';

import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

import { postConfirmTrip } from '../_apis/postConfirmTrip';

export const usePostConfirmTrip = () => {
  const mutationFn = useAuthenticatedMutationFn(postConfirmTrip);

  const {
    mutate: postConfirmTripMutation,
    isPending: isPostConfirmTripPending,
  } = useMutation({ mutationFn });

  return { postConfirmTripMutation, isPostConfirmTripPending };
};
