import { useMutation } from '@tanstack/react-query';

import { deleteDeviceToken } from '@/apis/notification';
import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

export const useDeleteDeviceToken = () => {
  const mutationFn = useAuthenticatedMutationFn(deleteDeviceToken);

  const {
    mutate: deleteDeviceTokenMutation,
    mutateAsync: deleteDeviceTokenMutationAsync,
    isPending: isDeleteDeviceTokenPending,
  } = useMutation({ mutationFn });

  return {
    deleteDeviceTokenMutation,
    deleteDeviceTokenMutationAsync,
    isDeleteDeviceTokenPending,
  };
};
