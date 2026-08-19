import { useMutation } from '@tanstack/react-query';

import { patchVacationPolicy } from '@/apis/vacationPolicy';
import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

export const usePatchVacationPolicy = () => {
  const mutationFn = useAuthenticatedMutationFn(patchVacationPolicy);

  const {
    mutateAsync: patchVacationPolicyMutation,
    isPending: isPatchVacationPolicyPending,
  } = useMutation({ mutationFn });

  return { patchVacationPolicyMutation, isPatchVacationPolicyPending };
};
