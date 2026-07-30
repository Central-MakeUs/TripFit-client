import { useMutation } from '@tanstack/react-query';

import { deleteRoomMember } from '../_apis/deleteRoomMember';

const TEMP_USER_ID = process.env.NEXT_PUBLIC_TEMP_USER_ID ?? '';

export const useDeleteRoomMember = () => {
  const ownerId = TEMP_USER_ID;
  // TODO: 로그인 유저 전역 상태 도입 후 아래로 교체
  // const ownerId = useUserStore((state) => state.userId);

  const {
    mutate: deleteRoomMemberMutation,
    isPending: isDeleteRoomMemberPending,
  } = useMutation({
    mutationFn: ({
      roomId,
      targetUserId,
    }: {
      roomId: string;
      targetUserId: string;
    }) => deleteRoomMember(roomId, targetUserId, ownerId),
  });

  return { deleteRoomMemberMutation, isDeleteRoomMemberPending };
};
