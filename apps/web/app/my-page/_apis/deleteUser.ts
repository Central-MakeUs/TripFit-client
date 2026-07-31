import { request } from '@/apis/request';

export const deleteUser = () =>
  request<void>('/api/v1/users/me', { method: 'DELETE' });
