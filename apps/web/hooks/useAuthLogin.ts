import { useMutation } from '@tanstack/react-query';

import { postAuthLogin } from '@/apis/auth';
import { useAuthStore } from '@/stores/authStore';

export const useAuthLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    mutate: authLoginMutation,
    isPending: isAuthLoginPending,
    error: authLoginError,
  } = useMutation({
    mutationFn: postAuthLogin,
    onSuccess: (data) => {
      setAuth({
        userId: data.user.id,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        nickname: data.user.nickname,
        profileImageUrl: data.user.profileImageUrl,
        provider: data.user.provider,
        hasName: !!(data.user.firstName && data.user.lastName),
        hasPreSchedule: data.user.hasPreSchedule,
        isAllFree: data.user.isAllFree,
      });
    },
  });

  return { authLoginMutation, isAuthLoginPending, authLoginError };
};
