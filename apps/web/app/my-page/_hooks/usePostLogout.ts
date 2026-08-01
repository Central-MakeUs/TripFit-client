import { useMutation } from '@tanstack/react-query';

import { deleteDeviceToken } from '@/apis/notification';
import { useAuthStore } from '@/stores/authStore';

import { postLogout } from '../_apis/postLogout';

export const usePostLogout = () => {
  const refreshToken = useAuthStore((state) => state.refreshToken);
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
      // refreshToken은 새로고침 이후엔 메모리에서 사라질 수 있다(보안상 localStorage 미저장) —
      // 그 경우 서버에 폐기 요청은 못 보내지만, 로컬 로그아웃(clear)까지 막을 이유는 없다.
      return refreshToken ? postLogout({ refreshToken }) : Promise.resolve();
    },
    onSuccess: () => clear(),
  });

  return { postLogoutMutation, isPostLogoutPending, postLogoutError };
};
