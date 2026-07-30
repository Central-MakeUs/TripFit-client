import { useQuery } from '@tanstack/react-query';

import { ApiError } from '@/apis/request';

import { getRoom, GetRoomResponseT } from '../_apis/getRoom';

export const useGetRoom = (roomId: string) => {
  const {
    data: roomData,
    isLoading: isGetRoomLoading,
    isError: isGetRoomError,
    error: getRoomError,
    refetch: refetchRoom,
  } = useQuery<GetRoomResponseT, ApiError>({
    queryKey: ['room', roomId],
    queryFn: () => getRoom(roomId),
  });

  return {
    roomData,
    isGetRoomLoading,
    isGetRoomError,
    getRoomError,
    refetchRoom,
  };
};
