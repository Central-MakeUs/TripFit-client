'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Spinner from '@/components/spinner';
import { useGetNotifications } from '@/hooks/useGetNotifications';
import { NotificationT } from '@/types/notification';
import { getLandingPath } from '@/utils/getLandingPath';

import { usePatchNotificationRead } from '../_hooks/usePatchNotificationRead';
import { groupNotificationsBySection } from '../_utils/groupNotificationsBySection';
import NotificationCard from './NotificationCard';
import NotificationsEmptyState from './NotificationsEmptyState';

function NotificationsList() {
  const router = useRouter();
  const {
    notificationsData,
    isGetNotificationsLoading,
    isGetNotificationsError,
  } = useGetNotifications();
  const { patchNotificationReadMutation } = usePatchNotificationRead();
  const [optimisticallyReadIds, setOptimisticallyReadIds] = useState<
    Set<string>
  >(new Set());

  if (isGetNotificationsLoading) {
    return (
      <div className="flex w-full flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isGetNotificationsError || !notificationsData) {
    return (
      <div className="flex w-full flex-1 items-center justify-center">
        <span className="text-body-03 text-grey-500">
          알림을 불러오지 못했어요
        </span>
      </div>
    );
  }

  const notifications = notificationsData.map((notification) =>
    optimisticallyReadIds.has(notification.id)
      ? { ...notification, isRead: true }
      : notification,
  );
  const sections = groupNotificationsBySection(notifications);

  const handleClickNotification = (notification: NotificationT) => {
    setOptimisticallyReadIds((prev) => new Set(prev).add(notification.id));
    patchNotificationReadMutation(notification.id);
    router.push(getLandingPath(notification.landingType, notification.tripId));
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
