import { useMutation } from '@tanstack/react-query';

import { postRoom, PostRoomRequestT } from '../_apis/postRoom';

const TEMP_USER_ID = '1';

export const usePostRoom = () => {
  const userId = TEMP_USER_ID;
  // TODO: 로그인 유저 전역 상태 도입 후 아래로 교체
  // const userId = useUserStore((state) => state.userId);

  const {
    mutate: postRoomMutation,
    isPending: isPostRoomPending,
    error: postRoomError,
  } = useMutation({
    mutationFn: (requestBody: PostRoomRequestT) =>
      postRoom(requestBody, userId),
  });

  return { postRoomMutation, isPostRoomPending, postRoomError };
};
