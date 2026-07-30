import { request } from '@/apis/request';

export const deleteRoom = async (
  roomId: string,
  userId: string,
): Promise<void> => {
  await request(`/api/v1/trips/${roomId}?userId=${userId}`, {
    method: 'DELETE',
  });
};
