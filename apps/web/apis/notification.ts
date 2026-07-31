import { request } from '@/apis/request';
import { DeviceTypeT } from '@/types/notification';

export type PostDeviceTokenRequestT = {
  token: string;
  deviceType: DeviceTypeT;
};

export const postDeviceToken = (requestBody: PostDeviceTokenRequestT) =>
  request<void>('/api/v1/notifications/device-tokens', {
    method: 'POST',
    data: requestBody,
  });

export const deleteDeviceToken = (token: string) =>
  request<void>('/api/v1/notifications/device-tokens', {
    method: 'DELETE',
    params: { token },
  });
