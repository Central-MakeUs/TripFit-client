import { useMutation } from '@tanstack/react-query';

import { deleteRegularSchedule } from '@/apis/regularSchedule';
import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

export const useDeleteRegularSchedule = () => {
  const mutationFn = useAuthenticatedMutationFn(deleteRegularSchedule);

  const {
    mutateAsync: deleteRegularScheduleMutation,
    isPending: isDeleteRegularSchedulePending,
  } = useMutation({ mutationFn });

  return { deleteRegularScheduleMutation, isDeleteRegularSchedulePending };
};
