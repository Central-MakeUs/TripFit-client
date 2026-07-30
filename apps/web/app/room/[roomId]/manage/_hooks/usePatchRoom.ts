import { useMutation } from '@tanstack/react-query';

import { patchRoom, PatchRoomRequestT } from '../_apis/patchRoom';

const TEMP_USER_ID = process.env.NEXT_PUBLIC_TEMP_USER_ID ?? '';

export const usePatchRoom = () => {
  const userId = TEMP_USER_ID;
  // TODO: 로그인 유저 전역 상태 도입 후 아래로 교체
  // const userId = useUserStore((state) => state.userId);

  const { mutate: patchRoomMutation, isPending: isPatchRoomPending } =
    useMutation({
      mutationFn: ({
        roomId,
        requestBody,
      }: {
        roomId: string;
        requestBody: PatchRoomRequestT;
      }) => patchRoom(roomId, requestBody, userId),
    });

  return { patchRoomMutation, isPatchRoomPending };
};
