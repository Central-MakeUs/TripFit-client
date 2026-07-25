import { useQuery } from '@tanstack/react-query';

import { getRoomMembers } from '../_apis/getRoomMembers';

const TEMP_USER_ID = process.env.NEXT_PUBLIC_TEMP_USER_ID ?? '';

export const useGetRoomMembers = (roomId: string) => {
  const userId = TEMP_USER_ID;
  // TODO: 로그인 유저 전역 상태 도입 후 아래로 교체
  // const userId = useUserStore((state) => state.userId);

  const {
    data: roomMembersData,
    isLoading: isGetRoomMembersLoading,
    isError: isGetRoomMembersError,
  } = useQuery({
    queryKey: ['room-members', roomId],
    queryFn: () => getRoomMembers(roomId, userId),
  });

  return { roomMembersData, isGetRoomMembersLoading, isGetRoomMembersError };
};
