import { useMutation } from '@tanstack/react-query';

import { deleteDeviceToken } from '@/apis/notification';
import { useAuthStore } from '@/stores/authStore';

import { postLogout } from '../_apis/postLogout';

export const usePostLogout = () => {
  const pushDeviceToken = useAuthStore((state) => state.pushDeviceToken);
  const clear = useAuthStore((state) => state.clear);

  const {
    mutate: postLogoutMutation,
    isPending: isPostLogoutPending,
    error: postLogoutError,
  } = useMutation({
    mutationFn: async () => {
      // clear()로 accessToken이 사라지기 전에(인증이 필요한 요청이라) 먼저 해제한다.
      // 해제 실패로 로그아웃 자체가 막히면 안 되니 실패는 무시한다.
      if (pushDeviceToken) {
        await deleteDeviceToken(pushDeviceToken).catch(() => {});
      }
      // refreshToken은 HttpOnly 쿠키라 브라우저가 자동으로 실어 보낸다 — 프론트가
      // 직접 읽거나 넘길 값이 없다.
      return postLogout();
    },
    onSuccess: () => clear(),
  });

  return { postLogoutMutation, isPostLogoutPending, postLogoutError };
};
