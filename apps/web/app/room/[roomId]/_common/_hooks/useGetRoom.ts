import { useQuery } from '@tanstack/react-query';

import { ApiError } from '@/apis/request';

import { getRoom, GetRoomResponseT } from '../_apis/getRoom';

const TEMP_USER_ID = process.env.NEXT_PUBLIC_TEMP_USER_ID ?? '';

export const useGetRoom = (roomId: string) => {
  const userId = TEMP_USER_ID;
  // TODO: 로그인 유저 전역 상태 도입 후 아래로 교체
  // const userId = useUserStore((state) => state.userId);

  const {
    data: roomData,
    isLoading: isGetRoomLoading,
    isError: isGetRoomError,
    error: getRoomError,
    refetch: refetchRoom,
  } = useQuery<GetRoomResponseT, ApiError>({
    queryKey: ['room', roomId],
    queryFn: () => getRoom(roomId, userId),
  });

  return {
    roomData,
    isGetRoomLoading,
    isGetRoomError,
    getRoomError,
    refetchRoom,
  };
};
