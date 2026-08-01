import { useQuery } from '@tanstack/react-query';

import {
  getScheduleCalendar,
  GetScheduleCalendarRequestT,
} from '@/apis/getScheduleCalendar';

export const useGetScheduleCalendar = (params: GetScheduleCalendarRequestT) => {
  const { refetch: refetchScheduleCalendar } = useQuery({
    queryKey: ['scheduleCalendar', params],
    queryFn: () => getScheduleCalendar(params),
    enabled: false,
  });

  return { refetchScheduleCalendar };
};
