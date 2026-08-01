import { useQuery } from '@tanstack/react-query';

import { getNotifications } from '@/apis/notification';

export const useGetNotifications = () => {
  const {
    data: notificationsData,
    isLoading: isGetNotificationsLoading,
    isError: isGetNotificationsError,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  return {
    notificationsData,
    isGetNotificationsLoading,
    isGetNotificationsError,
  };
};
