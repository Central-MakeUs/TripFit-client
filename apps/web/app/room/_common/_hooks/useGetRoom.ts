import { useQuery } from '@tanstack/react-query';

import { ApiError } from '@/apis/request';
import { useAuthStore } from '@/stores/authStore';

import { getRoom, GetRoomResponseT } from '../_apis/getRoom';

export const useGetRoom = (roomId: string, options?: { enabled?: boolean }) => {
  const userId = useAuthStore((state) => state.userId) ?? '';

  const {
    data: roomData,
    isLoading: isGetRoomLoading,
    isError: isGetRoomError,
    error: getRoomError,
    refetch: refetchRoom,
  } = useQuery<GetRoomResponseT, ApiError>({
    queryKey: ['room', roomId, userId],
    queryFn: () => getRoom(roomId),
    enabled: options?.enabled ?? true,
  });

  return {
    roomData,
    isGetRoomLoading,
    isGetRoomError,
    getRoomError,
    refetchRoom,
  };
};
