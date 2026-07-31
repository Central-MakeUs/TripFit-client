import { useMutation } from '@tanstack/react-query';

import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

import { patchNotificationRead } from '../_apis/patchNotificationRead';

export const usePatchNotificationRead = () => {
  const mutationFn = useAuthenticatedMutationFn(patchNotificationRead);

  const {
    mutate: patchNotificationReadMutation,
    isPending: isPatchNotificationReadPending,
  } = useMutation({ mutationFn });

  return { patchNotificationReadMutation, isPatchNotificationReadPending };
};
