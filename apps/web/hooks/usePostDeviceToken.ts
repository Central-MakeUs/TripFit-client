import { useMutation } from '@tanstack/react-query';

import { postDeviceToken } from '@/apis/notification';

import { useAuthenticatedMutationFn } from './useAuthenticatedMutationFn';

export const usePostDeviceToken = () => {
  const mutationFn = useAuthenticatedMutationFn(postDeviceToken);

  const {
    mutate: postDeviceTokenMutation,
    mutateAsync: postDeviceTokenMutationAsync,
    isPending: isPostDeviceTokenPending,
  } = useMutation({ mutationFn });

  return {
    postDeviceTokenMutation,
    postDeviceTokenMutationAsync,
    isPostDeviceTokenPending,
  };
};
