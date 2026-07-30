import { useMutation } from '@tanstack/react-query';

import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';
import { useAuthStore } from '@/stores/authStore';

import { patchOnboardingName } from '../_apis/patchOnboardingName';

export const usePatchOnboardingName = () => {
  const setName = useAuthStore((state) => state.setName);
  const mutationFn = useAuthenticatedMutationFn(patchOnboardingName);

  const {
    mutate: patchOnboardingNameMutation,
    isPending: isPatchOnboardingNamePending,
    error: patchOnboardingNameError,
  } = useMutation({
    mutationFn,
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
