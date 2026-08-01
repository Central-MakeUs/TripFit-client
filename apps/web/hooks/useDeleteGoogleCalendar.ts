import { useMutation } from '@tanstack/react-query';

import { deleteGoogleCalendar } from '@/apis/googleCalendar';

import { useAuthenticatedMutationFn } from './useAuthenticatedMutationFn';

export const useDeleteGoogleCalendar = () => {
  const mutationFn = useAuthenticatedMutationFn(deleteGoogleCalendar);

  const {
    mutate: deleteGoogleCalendarMutation,
    isPending: isDeleteGoogleCalendarPending,
  } = useMutation({ mutationFn });

  return { deleteGoogleCalendarMutation, isDeleteGoogleCalendarPending };
};
