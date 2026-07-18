import { memo } from 'react';

import AddIcon from '@/assets/icons/add.svg';
import KeepFillIcon from '@/assets/icons/keep-fill.svg';
import KeepLineIcon from '@/assets/icons/keep-line.svg';
import IconButton from '@/components/icon-button';
import ProgressBar from '@/components/progress-bar';
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
      id: number;
      isHost?: boolean;
      isPinned?: boolean;
      lastActivityAt: string;
      nights: number;
      onClick?: () => void;
      onPin?: () => void;
      participants: ParticipantT[];
      progress: number; // 0 ~ 100
      respondedCount: number;
      statusTag?: string;
      title: string;
      type: 'fill';
    };

// 5명까지는 전부 아바타로 보여주고, 5명을 넘어갈 때만 4명 + "+N" 배지로 바뀐다
// (아바타 슬롯 자체는 항상 최대 5개).
const MAX_PARTICIPANT_SLOTS = 5;
const MAX_VISIBLE_PARTICIPANTS = 4;

function RoomCard(props: RoomCardProps) {
  if (props.type === 'empty') {
    return (
      <button
        type="button"
        onClick={props.onClick}
        className={cn(roomCardStyle({ type: 'empty' }), props.className)}
      >
        <AddIcon className="size-7 text-grey-400" />
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
    isPinned = false,
    nights,
    onClick,
    onPin,
    participants,
    progress,
    respondedCount,
    statusTag,
    title,
  } = props;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  const handlePin = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onPin?.();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        roomCardStyle({ type: 'fill' }),
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700',
        className,
      )}
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
                {nights}
                <span className="font-semibold">박</span> {days}
                <span className="font-semibold">일</span>
              </span>
              <span>·</span>
              <span>{dateRange}</span>
            </p>
          </div>
        </div>
        <div className="flex h-9 items-end">
          <IconButton
            size="default"
            onClick={handlePin}
            aria-label={isPinned ? '고정 해제' : '고정하기'}
            icon={
              isPinned ? (
                <KeepFillIcon className="text-blue-700" />
              ) : (
                <KeepLineIcon className="text-blue-700" />
              )
            }
          />
        </div>
      </div>

      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {participants
                .slice(
                  0,
                  participants.length > MAX_PARTICIPANT_SLOTS
                    ? MAX_VISIBLE_PARTICIPANTS
                    : MAX_PARTICIPANT_SLOTS,
                )
                .map((participant, index) => (
                  <div
                    key={participant.name}
                    className={index === 0 ? '' : '-ml-1'}
                    style={{ zIndex: MAX_VISIBLE_PARTICIPANTS - index }}
                  >
                    <Profile
                      size="S"
                      text={participant.name}
                      color={participant.color}
                      tone={participant.tone}
                    />
                  </div>
                ))}
              {participants.length > MAX_PARTICIPANT_SLOTS && (
                <div className="-ml-1" style={{ zIndex: 0 }}>
                  <Profile
                    size="S"
                    disabled
                    text={`+${participants.length - MAX_VISIBLE_PARTICIPANTS}`}
                  />
                </div>
              )}
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
        <ProgressBar value={progress} size="lg" trackColor="white" />
      </div>
    </div>
  );
}

export default memo(RoomCard);
