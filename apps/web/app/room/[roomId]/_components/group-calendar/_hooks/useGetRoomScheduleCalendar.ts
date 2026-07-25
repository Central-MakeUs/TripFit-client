import { useQuery } from '@tanstack/react-query';

import { getRoomScheduleCalendar } from '../_apis/getRoomScheduleCalendar';

const TEMP_USER_ID = process.env.NEXT_PUBLIC_TEMP_USER_ID ?? '';

export const useGetRoomScheduleCalendar = (roomId: string) => {
  const userId = TEMP_USER_ID;
  // TODO: 로그인 유저 전역 상태 도입 후 아래로 교체
  // const userId = useUserStore((state) => state.userId);

  const {
    data: roomScheduleCalendarData,
    isLoading: isGetRoomScheduleCalendarLoading,
    isError: isGetRoomScheduleCalendarError,
  } = useQuery({
    queryKey: ['room-schedule-calendar', roomId],
    queryFn: () => getRoomScheduleCalendar(roomId, userId),
  });

  return {
    roomScheduleCalendarData,
    isGetRoomScheduleCalendarLoading,
    isGetRoomScheduleCalendarError,
  };
};
