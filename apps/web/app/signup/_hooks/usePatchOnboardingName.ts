import { useMutation } from '@tanstack/react-query';

import { patchOnboardingName, PatchOnboardingNameRequestT } from '@/apis/users';
import { useAuthStore } from '@/stores/authStore';

export const usePatchOnboardingName = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setName = useAuthStore((state) => state.setName);

  const {
    mutate: patchOnboardingNameMutation,
    isPending: isPatchOnboardingNamePending,
    error: patchOnboardingNameError,
  } = useMutation({
    mutationFn: (requestBody: PatchOnboardingNameRequestT) => {
      if (!accessToken) {
        return Promise.reject(new Error('로그인이 필요합니다.'));
      }
      return patchOnboardingName(requestBody);
    },
    onSuccess: (data) =>
      setName({
        firstName: data.firstName,
        lastName: data.lastName,
        nickname: data.nickname,
      }),
  });

  return {
    patchOnboardingNameMutation,
    isPatchOnboardingNamePending,
    patchOnboardingNameError,
  };
};
