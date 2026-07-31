import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthenticatedMutationFn } from '@/hooks/useAuthenticatedMutationFn';

import { GetTripsResponseT } from '../_apis/getTrips';
import { patchTripPin } from '../_apis/patchTripPin';
import { TRIPS_QUERY_KEY } from './useGetTrips';

export const usePatchTripPin = () => {
  const queryClient = useQueryClient();
  const mutationFn = useAuthenticatedMutationFn(patchTripPin);

  const { mutate: patchTripPinMutation, isPending: isPatchTripPinPending } =
    useMutation({
      mutationFn,
      onMutate: async ({ tripId, pinned }) => {
        await queryClient.cancelQueries({ queryKey: TRIPS_QUERY_KEY });

        const previousQueries = queryClient.getQueriesData<GetTripsResponseT>({
          queryKey: TRIPS_QUERY_KEY,
        });

        previousQueries.forEach(([queryKey, data]) => {
          if (!data) return;
          queryClient.setQueryData<GetTripsResponseT>(queryKey, {
            trips: data.trips.map((trip) =>
              trip.tripId === tripId ? { ...trip, pinned } : trip,
            ),
          });
        });

        return { previousQueries };
      },
      onError: (_error, _variables, context) => {
        context?.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      },
      onSettled: () => {
        // 핀 색깔은 위 onMutate 낙관적 업데이트로 바로 반영하고, 실제 순서
        // 재배치는 새로고침(재마운트) 때만 보이도록 refetchType: 'none'으로
        // 캐시를 stale 처리만 하고 지금 당장 다시 fetch하지는 않는다.
        queryClient.invalidateQueries({
          queryKey: TRIPS_QUERY_KEY,
          refetchType: 'none',
        });
      },
    });

  return { patchTripPinMutation, isPatchTripPinPending };
};
