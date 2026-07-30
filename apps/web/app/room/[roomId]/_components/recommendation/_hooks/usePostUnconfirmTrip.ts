import { useMutation } from '@tanstack/react-query';

import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

import { postUnconfirmTrip } from '../_apis/postUnconfirmTrip';

export const usePostUnconfirmTrip = () => {
  const mutationFn = useAuthenticatedMutationFn(postUnconfirmTrip);

  const {
    mutate: postUnconfirmTripMutation,
    isPending: isPostUnconfirmTripPending,
  } = useMutation({ mutationFn });

  return { postUnconfirmTripMutation, isPostUnconfirmTripPending };
};
