import { useMutation } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';

import { postRoom, PostRoomRequestT } from '../_apis/postRoom';

export const usePostRoom = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const {
    mutate: postRoomMutation,
    isPending: isPostRoomPending,
    error: postRoomError,
  } = useMutation({
    mutationFn: (requestBody: PostRoomRequestT) => {
      if (!accessToken) {
        return Promise.reject(new Error('로그인이 필요합니다.'));
      }
      return postRoom(requestBody);
    },
  });

  return { postRoomMutation, isPostRoomPending, postRoomError };
};
