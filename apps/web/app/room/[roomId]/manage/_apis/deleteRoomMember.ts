import { request } from '@/apis/request';

export const deleteRoomMember = async (
  roomId: string,
  targetUserId: string,
  ownerId: string,
): Promise<void> => {
  await request(
    `/api/v1/trips/${roomId}/members/${targetUserId}?ownerId=${ownerId}`,
    { method: 'DELETE' },
  );
};
