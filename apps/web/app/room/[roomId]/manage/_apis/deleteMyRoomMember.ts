import { request } from '@/apis/request';

export const deleteMyRoomMember = async (roomId: string): Promise<void> => {
  await request(`/api/v1/trips/${roomId}/members/me`, {
    method: 'DELETE',
  });
};
