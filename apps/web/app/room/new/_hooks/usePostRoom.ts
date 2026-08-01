import { useMutation } from '@tanstack/react-query';

import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

import { postRoom } from '../_apis/postRoom';

export const usePostRoom = () => {
  const mutationFn = useAuthenticatedMutationFn(postRoom);

  const {
    mutate: postRoomMutation,
    isPending: isPostRoomPending,
    error: postRoomError,
  } = useMutation({ mutationFn });

  return { postRoomMutation, isPostRoomPending, postRoomError };
};
