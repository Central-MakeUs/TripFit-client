import { useMutation } from '@tanstack/react-query';

import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

import { deleteRoomMember } from '../_apis/deleteRoomMember';

export const useDeleteRoomMember = () => {
  const mutationFn = useAuthenticatedMutationFn(deleteRoomMember);

  const {
    mutate: deleteRoomMemberMutation,
    isPending: isDeleteRoomMemberPending,
  } = useMutation({ mutationFn });

  return { deleteRoomMemberMutation, isDeleteRoomMemberPending };
};
