import { useMutation } from '@tanstack/react-query';

import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

import { postScheduleConfirm } from '../_apis/postScheduleConfirm';

export const usePostScheduleConfirm = () => {
  const mutationFn = useAuthenticatedMutationFn(postScheduleConfirm);

  const {
    mutateAsync: postScheduleConfirmMutationAsync,
    isPending: isPostScheduleConfirmPending,
  } = useMutation({ mutationFn });

  return { postScheduleConfirmMutationAsync, isPostScheduleConfirmPending };
};
