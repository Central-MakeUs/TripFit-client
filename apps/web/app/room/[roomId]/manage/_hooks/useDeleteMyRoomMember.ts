import { useMutation } from '@tanstack/react-query';

import { deleteMyRoomMember } from '../_apis/deleteMyRoomMember';

const TEMP_USER_ID = process.env.NEXT_PUBLIC_TEMP_USER_ID ?? '';

export const useDeleteMyRoomMember = () => {
  const userId = TEMP_USER_ID;
  // TODO: 로그인 유저 전역 상태 도입 후 아래로 교체
  // const userId = useUserStore((state) => state.userId);

  const {
    mutate: deleteMyRoomMemberMutation,
    isPending: isDeleteMyRoomMemberPending,
  } = useMutation({
    mutationFn: (roomId: string) => deleteMyRoomMember(roomId, userId),
  });

  return { deleteMyRoomMemberMutation, isDeleteMyRoomMemberPending };
};
