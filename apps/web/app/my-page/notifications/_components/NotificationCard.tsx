import NotificationIcon from '@/assets/icons/notification.svg';
import { NotificationT } from '@/types/notification';
import { cn } from '@/utils/cn';

type NotificationCardProps = {
  notification: NotificationT;
};

function NotificationCard({ notification }: NotificationCardProps) {
  const { roomName, message, isRead } = notification;

  return (
    <li className="flex w-full items-start gap-3 rounded-2xl bg-white pt-2 pr-3 pb-3 pl-3">
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full',
          isRead ? 'bg-grey-20 text-grey-400' : 'bg-blue-20 text-blue-500',
        )}
      >
        <NotificationIcon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-caption-03 text-grey-400">{roomName}</span>
        <p className="text-caption-01 text-grey-800 whitespace-pre-line">
          {message}
        </p>
      </div>
    </li>
  );
}

export default NotificationCard;
