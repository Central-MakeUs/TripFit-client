import { useMutation } from '@tanstack/react-query';

import { postAuthLogin } from '@/apis/auth';
import { useAuthStore } from '@/stores/authStore';

export const usePostAuthLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    mutate: postAuthLoginMutation,
    isPending: isPostAuthLoginPending,
    error: postAuthLoginError,
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
        notificationEnabled: data.user.notificationEnabled,
        isGoogleCalendarConnected: data.user.isGoogleCalendarConnected,
      });
    },
  });

  return {
    postAuthLoginMutation,
    isPostAuthLoginPending,
    postAuthLoginError,
  };
};
