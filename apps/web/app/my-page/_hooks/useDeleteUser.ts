import { useMutation } from '@tanstack/react-query';

import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';
import { useAuthStore } from '@/stores/authStore';

import { deleteUser } from '../_apis/deleteUser';

export const useDeleteUser = () => {
  const clear = useAuthStore((state) => state.clear);
  const mutationFn = useAuthenticatedMutationFn<void, void>(deleteUser);

  const {
    mutate: deleteUserMutation,
    isPending: isDeleteUserPending,
    error: deleteUserError,
  } = useMutation({
    mutationFn,
    onSuccess: () => clear(),
  });

  return { deleteUserMutation, isDeleteUserPending, deleteUserError };
};
