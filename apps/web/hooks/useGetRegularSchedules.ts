import { useQuery } from '@tanstack/react-query';

import { getRegularSchedules } from '@/apis/regularSchedule';

export const REGULAR_SCHEDULES_QUERY_KEY = ['regularSchedules'];

export const useGetRegularSchedules = (options?: { enabled?: boolean }) => {
  const { data: regularSchedulesData, isLoading: isRegularSchedulesLoading } =
    useQuery({
      queryKey: REGULAR_SCHEDULES_QUERY_KEY,
      queryFn: getRegularSchedules,
      select: (response) => response.items,
      enabled: options?.enabled,
    });

  return { regularSchedulesData, isRegularSchedulesLoading };
};
