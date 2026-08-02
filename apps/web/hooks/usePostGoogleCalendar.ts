import { useMutation } from '@tanstack/react-query';

import { postGoogleCalendar } from '@/apis/googleCalendar';

import { useAuthenticatedMutationFn } from './useAuthenticatedMutationFn';

export const usePostGoogleCalendar = () => {
  const mutationFn = useAuthenticatedMutationFn(postGoogleCalendar);

  const {
    mutate: postGoogleCalendarMutation,
    mutateAsync: postGoogleCalendarMutationAsync,
    isPending: isPostGoogleCalendarPending,
  } = useMutation({ mutationFn });

  return {
    postGoogleCalendarMutation,
    postGoogleCalendarMutationAsync,
    isPostGoogleCalendarPending,
  };
};
