import { request } from '@/apis/request';

export const patchNotificationRead = (notificationId: string) =>
  request<void>(`/api/v1/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
