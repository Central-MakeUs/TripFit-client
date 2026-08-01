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
    const sentAt = parseISO(notification.sentAt);
    if (isToday(sentAt)) {
      today.push(notification);
    } else if (isYesterday(sentAt)) {
      yesterday.push(notification);
    } else {
      const daysAgo = differenceInCalendarDays(new Date(), sentAt);
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
