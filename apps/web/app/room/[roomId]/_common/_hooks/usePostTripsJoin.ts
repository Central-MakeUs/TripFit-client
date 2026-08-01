import { useMutation } from '@tanstack/react-query';

import { postTripsJoin } from '../_apis/postTripsJoin';

export const usePostTripsJoin = () => {
  const {
    mutateAsync: postTripsJoinMutation,
    isPending: isPostTripsJoinPending,
  } = useMutation({
    mutationFn: postTripsJoin,
  });

  return { postTripsJoinMutation, isPostTripsJoinPending };
};
