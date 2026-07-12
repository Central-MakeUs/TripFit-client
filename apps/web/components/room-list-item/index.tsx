import MoreVertIcon from '@/assets/icons/more-vert.svg';
import Tag from '@/components/tag';
import { cn } from '@/utils/cn';

import { roomListItemStyle } from './roomListItem.style';

type RoomListItemProps = {
  className?: string;
  dateRange: string;
  isHost?: boolean;
  onClick?: () => void;
  onMoreClick?: () => void;
  statusTag?: string;
  title: string;
};

function RoomListItem({
  className,
  dateRange,
  isHost = false,
  onClick,
  onMoreClick,
  statusTag,
  title,
}: RoomListItemProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        roomListItemStyle,
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700',
        className,
      )}
    >
      <div className="flex flex-1 flex-col items-start gap-2">
        <div className="flex h-6 items-center gap-2">
          {isHost && <Tag category="icon-L" text="방장" type="primary" />}
          {statusTag && <Tag text={statusTag} type="secondary" />}
        </div>
        <div className="flex flex-col items-start gap-0.5">
          <p className="text-body-03 text-black">{title}</p>
          <p className="text-caption-04 text-grey-400">{dateRange}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onMoreClick?.();
        }}
        className="shrink-0 cursor-pointer"
      >
        <MoreVertIcon className="size-6 text-black" />
      </button>
    </div>
  );
}

export default RoomListItem;
