import { request } from '@/apis/request';

export const postScheduleConfirm = async (
  roomId: string,
  userId: string,
): Promise<void> => {
  await request(`/api/v1/trips/${roomId}/schedule/confirm?userId=${userId}`, {
    method: 'POST',
  });
};
