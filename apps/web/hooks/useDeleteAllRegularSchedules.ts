import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteAllRegularSchedules } from '@/apis/regularSchedule';
import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';
import { REGULAR_SCHEDULES_QUERY_KEY } from '@/hooks/useGetRegularSchedules';

export const useDeleteAllRegularSchedules = () => {
  const mutationFn = useAuthenticatedMutationFn(deleteAllRegularSchedules);
  const queryClient = useQueryClient();

  const {
    mutateAsync: deleteAllRegularSchedulesMutation,
    isPending: isDeleteAllRegularSchedulesPending,
  } = useMutation({
    mutationFn: () => mutationFn(undefined),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: REGULAR_SCHEDULES_QUERY_KEY,
      }),
  });

  return {
    deleteAllRegularSchedulesMutation,
    isDeleteAllRegularSchedulesPending,
  };
};
