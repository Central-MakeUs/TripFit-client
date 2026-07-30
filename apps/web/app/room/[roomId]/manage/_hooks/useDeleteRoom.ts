import { useMutation } from '@tanstack/react-query';

import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

import { deleteRoom } from '../_apis/deleteRoom';

export const useDeleteRoom = () => {
  const mutationFn = useAuthenticatedMutationFn(deleteRoom);

  const { mutate: deleteRoomMutation, isPending: isDeleteRoomPending } =
    useMutation({ mutationFn });

  return { deleteRoomMutation, isDeleteRoomPending };
};
