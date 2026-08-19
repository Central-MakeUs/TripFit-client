import { useMutation } from '@tanstack/react-query';

import { deleteAllRegularSchedules } from '@/apis/regularSchedule';
import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

export const useDeleteAllRegularSchedules = () => {
  const mutationFn = useAuthenticatedMutationFn(deleteAllRegularSchedules);

  const {
    mutateAsync: deleteAllRegularSchedulesMutation,
    isPending: isDeleteAllRegularSchedulesPending,
  } = useMutation({ mutationFn: () => mutationFn(undefined) });

  return {
    deleteAllRegularSchedulesMutation,
    isDeleteAllRegularSchedulesPending,
  };
};
