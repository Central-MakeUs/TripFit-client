'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { NotificationT } from '@/types/notification';

import { getNotificationLandingPath } from '../_utils/getNotificationLandingPath';
import { groupNotificationsBySection } from '../_utils/groupNotificationsBySection';
import NotificationCard from './NotificationCard';
import NotificationsEmptyState from './NotificationsEmptyState';

type NotificationsListProps = {
  initialNotifications: NotificationT[];
};

function NotificationsList({ initialNotifications }: NotificationsListProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const sections = groupNotificationsBySection(notifications);

  const handleClickNotification = (notification: NotificationT) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notification.id ? { ...item, isRead: true } : item,
      ),
    );
    router.push(getNotificationLandingPath(notification));
  };

  if (sections.length === 0) {
    return <NotificationsEmptyState />;
  }

  return (
    <div className="flex w-full flex-col gap-6 px-5 py-6">
      {sections.map((section) => (
        <div key={section.label} className="flex w-full flex-col gap-2">
          <h2 className="text-body-05 text-black">{section.label}</h2>
          <ul className="flex w-full flex-col gap-2">
            {section.notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onClick={() => handleClickNotification(notification)}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default NotificationsList;
