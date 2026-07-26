import Header from '@/components/header';

import { MOCK_NOTIFICATIONS } from './_mocks/notification';
import NotificationsList from './_components/NotificationsList';

function NotificationsPage() {
  return (
    <div className="flex w-full flex-1 flex-col bg-grey-20">
      <Header variant="page" title="여행방 알림" background="grey-20" />
      <NotificationsList initialNotifications={MOCK_NOTIFICATIONS} />
    </div>
  );
}

export default NotificationsPage;
