import { request } from '@/apis/request';

export const deleteTripsJoinHold = async (tripId: string): Promise<void> => {
  await request(`/api/v1/trips/${tripId}/join/hold`, {
    method: 'DELETE',
  });
};
