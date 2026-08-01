import { request } from '@/apis/request';

export type PostTripsJoinRequestT = {
  inviteCode: string;
};

export type PostTripsJoinResponseT = {
  tripId: string;
};

export const postTripsJoin = (requestBody: PostTripsJoinRequestT) =>
  request<PostTripsJoinResponseT>('/api/v1/trips/join', {
    method: 'POST',
    data: requestBody,
  });
