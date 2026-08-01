import { useMutation } from '@tanstack/react-query';

import { patchMyPageProfile } from '@/apis/patchMyPageProfile';
import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';
import { useAuthStore } from '@/stores/authStore';

export const usePatchMyPageProfile = () => {
  const setProfile = useAuthStore((state) => state.setProfile);
  const mutationFn = useAuthenticatedMutationFn(patchMyPageProfile);

  const {
    mutate: patchMyPageProfileMutation,
    isPending: isPatchMyPageProfilePending,
    error: patchMyPageProfileError,
  } = useMutation({
    mutationFn,
    onSuccess: (data) =>
      setProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        nickname: data.nickname,
        notificationEnabled: data.notificationEnabled,
      }),
  });

  return {
    patchMyPageProfileMutation,
    isPatchMyPageProfilePending,
    patchMyPageProfileError,
  };
};
