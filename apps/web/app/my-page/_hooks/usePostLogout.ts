import { useMutation } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';

import { postLogout } from '../_apis/postLogout';

export const usePostLogout = () => {
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clear = useAuthStore((state) => state.clear);

  const {
    mutate: postLogoutMutation,
    isPending: isPostLogoutPending,
    error: postLogoutError,
  } = useMutation({
    // refreshToken은 새로고침 이후엔 메모리에서 사라질 수 있다(보안상 localStorage 미저장) —
    // 그 경우 서버에 폐기 요청은 못 보내지만, 로컬 로그아웃(clear)까지 막을 이유는 없다.
    mutationFn: () =>
      refreshToken ? postLogout({ refreshToken }) : Promise.resolve(),
    onSuccess: () => clear(),
  });

  return { postLogoutMutation, isPostLogoutPending, postLogoutError };
};
