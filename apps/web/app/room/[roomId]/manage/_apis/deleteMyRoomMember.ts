import { request } from '@/apis/request';

export const deleteMyRoomMember = async (
  roomId: string,
  userId: string,
): Promise<void> => {
  await request(`/api/v1/trips/${roomId}/members/me?userId=${userId}`, {
    method: 'DELETE',
  });
};
