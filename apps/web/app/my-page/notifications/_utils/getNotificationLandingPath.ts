import { NotificationT } from '@/types/notification';

export const getNotificationLandingPath = (notification: NotificationT) => {
  if (notification.type === 'SCHEDULE_UPDATE_REMINDER') {
    return '/my-schedule';
  }
  return `/room/${notification.roomId}`;
};
