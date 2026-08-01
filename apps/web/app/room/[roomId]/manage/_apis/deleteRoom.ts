import { request } from '@/apis/request';

export const deleteRoom = async (roomId: string): Promise<void> => {
  await request(`/api/v1/trips/${roomId}`, {
    method: 'DELETE',
  });
};
