import Header from '@/components/header';

import { MOCK_NOTIFICATIONS } from './_mocks/notification';
import NotificationCard from './_components/NotificationCard';
import NotificationsEmptyState from './_components/NotificationsEmptyState';
import { groupNotificationsBySection } from './_utils/groupNotificationsBySection';

function NotificationsPage() {
  const sections = groupNotificationsBySection(MOCK_NOTIFICATIONS);

  return (
    <div className="flex w-full flex-1 flex-col bg-grey-20">
      <Header variant="page" title="여행방 알림" background="grey-20" />
      {sections.length === 0 ? (
        <NotificationsEmptyState />
      ) : (
        <div className="flex w-full flex-col gap-6 px-5 py-6">
          {sections.map((section) => (
            <div key={section.label} className="flex w-full flex-col gap-2">
              <h2 className="text-body-05 text-black">{section.label}</h2>
              <ul className="flex w-full flex-col gap-2">
                {section.notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
