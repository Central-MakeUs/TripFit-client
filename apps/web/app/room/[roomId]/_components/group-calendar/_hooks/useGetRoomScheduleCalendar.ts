import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';

import { getRoomScheduleCalendar } from '../_apis/getRoomScheduleCalendar';

export const useGetRoomScheduleCalendar = (roomId: string) => {
  const userId = useAuthStore((state) => state.userId) ?? '';

  const {
    data: roomScheduleCalendarData,
    isLoading: isGetRoomScheduleCalendarLoading,
    isError: isGetRoomScheduleCalendarError,
    refetch: refetchRoomScheduleCalendar,
  } = useQuery({
    queryKey: ['room-schedule-calendar', roomId, userId],
    queryFn: () => getRoomScheduleCalendar(roomId, userId),
  });

  return {
    roomScheduleCalendarData,
    isGetRoomScheduleCalendarLoading,
    isGetRoomScheduleCalendarError,
    refetchRoomScheduleCalendar,
  };
};
