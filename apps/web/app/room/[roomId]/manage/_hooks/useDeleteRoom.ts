import { useMutation } from '@tanstack/react-query';

import { deleteRoom } from '../_apis/deleteRoom';

const TEMP_USER_ID = process.env.NEXT_PUBLIC_TEMP_USER_ID ?? '';

export const useDeleteRoom = () => {
  const userId = TEMP_USER_ID;
  // TODO: 로그인 유저 전역 상태 도입 후 아래로 교체
  // const userId = useUserStore((state) => state.userId);

  const { mutate: deleteRoomMutation, isPending: isDeleteRoomPending } =
    useMutation({
      mutationFn: (roomId: string) => deleteRoom(roomId, userId),
    });

  return { deleteRoomMutation, isDeleteRoomPending };
};
