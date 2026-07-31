import { useMutation } from '@tanstack/react-query';

import { patchNotificationRead } from '@/apis/notification';
import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

export const usePatchNotificationRead = () => {
  const mutationFn = useAuthenticatedMutationFn(patchNotificationRead);

  const {
    mutate: patchNotificationReadMutation,
    isPending: isPatchNotificationReadPending,
  } = useMutation({ mutationFn });

  return { patchNotificationReadMutation, isPatchNotificationReadPending };
};
