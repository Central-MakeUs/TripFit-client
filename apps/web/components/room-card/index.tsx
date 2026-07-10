import Image from 'next/image';
import { memo } from 'react';

import Profile from '@/components/profile';
import Tag from '@/components/tag';
import { cn } from '@/utils/cn';

import { roomCardStyle } from './roomCard.style';

type ParticipantT = {
  color: 'purple' | 'pink' | 'orange' | 'yellow' | 'green';
  name: string;
  tone?: 1 | 2;
};

export type RoomCardProps =
  | {
      className?: string;
      onClick?: () => void;
      type: 'empty';
    }
  | {
      capacity: number;
      className?: string;
      dateRange: string;
      days: number;
      isHost?: boolean;
      nights: number;
      onClick?: () => void;
      onPin?: () => void;
      onShare?: () => void;
      participants: ParticipantT[];
      progress: number;
      respondedCount: number;
      statusTag?: string;
      title: string;
      type: 'fill';
    };

function RoomCard(props: RoomCardProps) {
  if (props.type === 'empty') {
    return (
      <button
        type="button"
        onClick={props.onClick}
        className={cn(roomCardStyle({ type: 'empty' }), props.className)}
      >
        <Image src="/icons/plus.svg" alt="" width={28} height={28} />
        <p className="text-body-04 text-grey-400">여행방 신규 생성하기</p>
      </button>
    );
  }

  const {
    capacity,
    className,
    dateRange,
    days,
    isHost = false,
    nights,
    onClick,
    onPin,
    onShare,
    participants,
    progress,
    respondedCount,
    statusTag,
    title,
  } = props;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={cn(roomCardStyle({ type: 'fill' }), className)}
    >
      <div className="flex w-full items-start justify-between">
        <div className="flex flex-1 flex-col items-start gap-3">
          <div className="flex h-6 items-center gap-2">
            {isHost && <Tag category="icon-L" text="방장" type="primary" />}
            {statusTag && <Tag text={statusTag} type="secondary" />}
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-body-01 text-black">{title}</p>
            <p className="flex items-center gap-2 text-caption-04 text-grey-400">
              <span>
                <span className="font-semibold">{nights}</span>박
                <span className="font-semibold">{days}</span>일
              </span>
              <span>·</span>
              <span>{dateRange}</span>
            </p>
          </div>
        </div>
        <div className="flex h-9 items-end">
          <button
            type="button"
            onClick={onPin}
            className="flex size-9 cursor-pointer items-center justify-center"
          >
            <Image src="/icons/pin.svg" alt="고정" width={24} height={24} />
          </button>
          <button
            type="button"
            onClick={onShare}
            className="flex size-9 cursor-pointer items-center justify-center"
          >
            <Image src="/icons/share.svg" alt="공유" width={24} height={24} />
          </button>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {participants.map((participant, index) => (
                <Profile
                  key={participant.name}
                  size="S"
                  text={participant.name}
                  color={participant.color}
                  tone={participant.tone}
                  className={index === 0 ? '' : '-ml-1'}
                />
              ))}
            </div>
            <p className="text-caption-04 text-grey-400">
              {participants[0]?.name} 외 {Math.max(participants.length - 1, 0)}
              명
            </p>
          </div>
          <p className="text-body-03 text-blue-700">
            {respondedCount}/{capacity}
          </p>
        </div>
        <div className="h-2.5 w-full rounded-full bg-white">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-500"
            style={{ width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(RoomCard);
