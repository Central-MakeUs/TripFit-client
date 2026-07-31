import { useMutation } from '@tanstack/react-query';

import { patchRegularSchedule } from '@/apis/regularSchedule';
import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

export const usePatchRegularSchedule = () => {
  const mutationFn = useAuthenticatedMutationFn(patchRegularSchedule);

  const {
    mutateAsync: patchRegularScheduleMutation,
    isPending: isPatchRegularSchedulePending,
  } = useMutation({ mutationFn });

  return { patchRegularScheduleMutation, isPatchRegularSchedulePending };
};
