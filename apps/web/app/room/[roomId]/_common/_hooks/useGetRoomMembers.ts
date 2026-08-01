import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore';

import { getRoomMembers } from '../_apis/getRoomMembers';

export const useGetRoomMembers = (
  roomId: string,
  options?: { enabled?: boolean },
) => {
  const userId = useAuthStore((state) => state.userId) ?? '';

  const {
    data: roomMembersData,
    isLoading: isGetRoomMembersLoading,
    isError: isGetRoomMembersError,
    refetch: refetchRoomMembers,
  } = useQuery({
    queryKey: ['room-members', roomId, userId],
    queryFn: () => getRoomMembers(roomId, userId),
    enabled: options?.enabled ?? true,
  });

  return {
    roomMembersData,
    isGetRoomMembersLoading,
    isGetRoomMembersError,
    refetchRoomMembers,
  };
};
