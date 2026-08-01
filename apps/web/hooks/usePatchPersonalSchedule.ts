import { useMutation } from '@tanstack/react-query';

import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

import { patchPersonalSchedule } from '@/apis/patchPersonalSchedule';

export const usePatchPersonalSchedule = () => {
  const mutationFn = useAuthenticatedMutationFn(patchPersonalSchedule);

  const {
    mutateAsync: patchPersonalScheduleMutation,
    isPending: isPatchPersonalSchedulePending,
  } = useMutation({ mutationFn });

  return { patchPersonalScheduleMutation, isPatchPersonalSchedulePending };
};
