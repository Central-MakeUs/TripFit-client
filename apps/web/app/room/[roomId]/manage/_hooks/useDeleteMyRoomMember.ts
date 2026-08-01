import { useMutation } from '@tanstack/react-query';

import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

import { deleteMyRoomMember } from '../_apis/deleteMyRoomMember';

export const useDeleteMyRoomMember = () => {
  const mutationFn = useAuthenticatedMutationFn(deleteMyRoomMember);

  const {
    mutate: deleteMyRoomMemberMutation,
    isPending: isDeleteMyRoomMemberPending,
  } = useMutation({ mutationFn });

  return { deleteMyRoomMemberMutation, isDeleteMyRoomMemberPending };
};
