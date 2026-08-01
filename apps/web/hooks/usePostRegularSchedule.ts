import { useMutation } from '@tanstack/react-query';

import { postRegularSchedule } from '@/apis/regularSchedule';
import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

export const usePostRegularSchedule = () => {
  const mutationFn = useAuthenticatedMutationFn(postRegularSchedule);

  const {
    mutateAsync: postRegularScheduleMutation,
    isPending: isPostRegularSchedulePending,
  } = useMutation({ mutationFn });

  return { postRegularScheduleMutation, isPostRegularSchedulePending };
};
