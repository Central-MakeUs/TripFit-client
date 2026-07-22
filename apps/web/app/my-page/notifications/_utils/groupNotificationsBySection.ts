import {
  differenceInCalendarDays,
  isToday,
  isYesterday,
  parseISO,
} from 'date-fns';

import { NotificationT } from '@/types/notification';

export type NotificationSectionT = {
  label: string;
  notifications: NotificationT[];
};

export const groupNotificationsBySection = (
  notifications: NotificationT[],
): NotificationSectionT[] => {
  const today: NotificationT[] = [];
  const yesterday: NotificationT[] = [];
  const recent7Days: NotificationT[] = [];

  notifications.forEach((notification) => {
    const createdAt = parseISO(notification.createdAt);
    if (isToday(createdAt)) {
      today.push(notification);
    } else if (isYesterday(createdAt)) {
      yesterday.push(notification);
    } else {
      const daysAgo = differenceInCalendarDays(new Date(), createdAt);
      if (daysAgo >= 2 && daysAgo <= 7) {
        recent7Days.push(notification);
      }
    }
  });

  return [
    { label: '오늘', notifications: today },
    { label: '어제', notifications: yesterday },
    { label: '최근 7일', notifications: recent7Days },
  ].filter((section) => section.notifications.length > 0);
};
