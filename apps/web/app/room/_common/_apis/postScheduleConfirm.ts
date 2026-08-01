import { request } from '@/apis/request';

export const postScheduleConfirm = async (roomId: string): Promise<void> => {
  await request(`/api/v1/trips/${roomId}/activate`, {
    method: 'POST',
  });
};
