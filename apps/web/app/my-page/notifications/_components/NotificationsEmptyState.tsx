import NotificationsOffIcon from '@/assets/icons/notifications-off.svg';

function NotificationsEmptyState() {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-4">
      <div className="flex size-17 items-center justify-center rounded-full bg-grey-100 text-grey-300">
        <NotificationsOffIcon className="size-12" />
      </div>
      <p className="text-body-03 text-grey-400">새로운 알림이 없어요</p>
    </div>
  );
}

export default NotificationsEmptyState;
