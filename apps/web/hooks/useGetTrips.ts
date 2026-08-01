import { useQuery } from '@tanstack/react-query';

import { getTrips, GetTripsRequestT } from '@/apis/getTrips';

export const TRIPS_QUERY_KEY = ['trips'];

export const useGetTrips = (requestParams: GetTripsRequestT) => {
  const { data: tripsData, isLoading: isTripsLoading } = useQuery({
    queryKey: [...TRIPS_QUERY_KEY, requestParams],
    queryFn: () => getTrips(requestParams),
    select: (response) => response.trips,
  });

  return { tripsData, isTripsLoading };
};
