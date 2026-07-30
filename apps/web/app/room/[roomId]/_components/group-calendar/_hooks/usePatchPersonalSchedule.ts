import { useMutation } from '@tanstack/react-query';

import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

import { patchPersonalSchedule } from '../_apis/patchPersonalSchedule';

export const usePatchPersonalSchedule = () => {
  const mutationFn = useAuthenticatedMutationFn(patchPersonalSchedule);

  const {
    mutate: patchPersonalScheduleMutation,
    isPending: isPatchPersonalSchedulePending,
  } = useMutation({ mutationFn });

  return { patchPersonalScheduleMutation, isPatchPersonalSchedulePending };
};
