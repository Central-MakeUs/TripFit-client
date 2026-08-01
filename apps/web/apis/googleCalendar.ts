import { request } from '@/apis/request';
import { UserSummaryT } from '@/types/auth';

export type PostGoogleCalendarRequestT = {
  authorizationCode: string;
  redirectUri?: string;
};

export type PostGoogleCalendarResponseT = UserSummaryT;

export const postGoogleCalendar = (requestBody: PostGoogleCalendarRequestT) =>
  request<PostGoogleCalendarResponseT>('/api/v1/users/google-calendar', {
    method: 'POST',
    data: requestBody,
  });

export const deleteGoogleCalendar = () =>
  request<void>('/api/v1/users/google-calendar', {
    method: 'DELETE',
  });
