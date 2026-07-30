import { useMutation } from '@tanstack/react-query';

import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

import { patchRoom } from '../_apis/patchRoom';

export const usePatchRoom = () => {
  const mutationFn = useAuthenticatedMutationFn(patchRoom);

  const { mutate: patchRoomMutation, isPending: isPatchRoomPending } =
    useMutation({ mutationFn });

  return { patchRoomMutation, isPatchRoomPending };
};
