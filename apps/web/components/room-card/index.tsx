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

export type MemberPreviewT = {
  displayName: string;
  profileImageUrl: string | null;
  role: 'OWNER' | 'MEMBER';
  userId: string;
};

// 참여자 아바타는 이름을 안 받아서 색으로 구분한다 — 순서(인덱스)에 고정 배정되며
// 특정 유저에게 늘 같은 색이 붙는 게 아니라 카드 안에서의 노출 순서에 따라 정해진다.
const MEMBER_AVATAR_COLORS = [
  'purple',
  'pink',
  'yellow',
  'green',
  'orange',
] as const;

// 전체 인원이 이 슬롯 수 이하면 전부 아바타로 보여주고(+N 배지 없음),
// 넘어가면 4명만 보여주고 나머지는 +N 배지로 합친다.
const MAX_PARTICIPANT_SLOTS = 5;
const MAX_VISIBLE_MEMBERS = 4;

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
      days: number | null;
      id: string;
      isHost?: boolean;
      isPinned?: boolean;
      lastActivityAt: string;
      membersPreview: MemberPreviewT[];
      membersPreviewOverflow: number;
      nights: number | null;
      onClick?: () => void;
      onPin?: () => void;
      progress: number; // 0 ~ 100
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
    membersPreview,
    membersPreviewOverflow,
    nights,
    onClick,
    onPin,
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

  // 방장을 항상 맨 앞에 오도록만 정렬하고, 나머지 순서(참여 시각 내림차순)는
  // 안정 정렬(stable sort)로 백엔드가 내려준 순서를 그대로 유지한다.
  const sortedMembers = [...membersPreview].sort((a, b) => {
    if (a.role === b.role) return 0;
    return a.role === 'OWNER' ? -1 : 1;
  });
  // membersPreview엔 아직 응답하지 않은 방장 등이 남아있을 수 있어(예: 응답
  // 0명인데도 방장 1명이 들어있는 경우), 실제로 응답한 인원 수(respondedCount)를
  // 넘는 항목은 신뢰하지 않는다. capacity(목표 인원)도 마찬가지로 실제 참여
  // 인원이 아니라서 슬롯/배지 계산엔 쓰지 않는다.
  const respondedMembers = sortedMembers.slice(0, respondedCount);
  const knownMemberTotal = respondedMembers.length + membersPreviewOverflow;
  const showAllMembers = knownMemberTotal <= MAX_PARTICIPANT_SLOTS;
  const maxVisibleSlots = showAllMembers
    ? MAX_PARTICIPANT_SLOTS
    : MAX_VISIBLE_MEMBERS;
  const visibleMembers = respondedMembers.slice(
    0,
    Math.min(maxVisibleSlots, respondedMembers.length),
  );
  const overflowCount = Math.max(knownMemberTotal - visibleMembers.length, 0);

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
                {nights !== null && days !== null ? (
                  <>
                    {nights}
                    <span className="font-semibold">박</span> {days}
                    <span className="font-semibold">일</span>
                  </>
                ) : (
                  '미정'
                )}
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
              {visibleMembers.map((member, index) => (
                <div
                  key={member.userId}
                  className={index === 0 ? '' : '-ml-1'}
                  style={{ zIndex: visibleMembers.length - index }}
                >
                  <Profile
                    size="S"
                    color={
                      MEMBER_AVATAR_COLORS[index % MEMBER_AVATAR_COLORS.length]
                    }
                    text={member.displayName}
                  />
                </div>
              ))}
              {overflowCount > 0 && (
                <div className="-ml-1" style={{ zIndex: 0 }}>
                  <Profile size="S" disabled text={`+${overflowCount}`} />
                </div>
              )}
            </div>
            {knownMemberTotal > 1 && (
              <p className="text-caption-04 text-grey-400">
                {visibleMembers[0]?.displayName} 외 {knownMemberTotal - 1}명
              </p>
            )}
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
