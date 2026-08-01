import { request } from '@/apis/request';

export const deleteRoomMember = async ({
  roomId,
  targetUserId,
}: {
  roomId: string;
  targetUserId: string;
}): Promise<void> => {
  await request(`/api/v1/trips/${roomId}/members/${targetUserId}`, {
    method: 'DELETE',
  });
};
