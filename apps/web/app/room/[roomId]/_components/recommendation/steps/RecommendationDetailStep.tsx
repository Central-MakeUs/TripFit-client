'use client';

import { ReactNode, useState } from 'react';

import CompletionIcon from '@/assets/icons/completion.svg';
import ThumbDownFillIcon from '@/assets/icons/thumb-down-fill-200.svg';
import ThumbDownIcon from '@/assets/icons/thumb-down-line-200.svg';
import ThumbUpFillIcon from '@/assets/icons/thumb-up-fill-200.svg';
import ThumbUpIcon from '@/assets/icons/thumb-up-line-200.svg';
import WarningIcon from '@/assets/icons/warning.svg';
import BottomSheet from '@/components/bottom-sheet';
import Button from '@/components/button';
import IconButton from '@/components/icon-button';
import Input from '@/components/input';
import Profile from '@/components/profile';
import ProgressBar from '@/components/progress-bar';
import RadioButton from '@/components/radio-button';
import Tag from '@/components/tag';
import {
  RecommendationCandidateDetailT,
  RecommendationParticipantT,
} from '@/types/recommendation';
import { cn } from '@/utils/cn';

import { formatDateLabel } from '../_utils/formatDateLabel';
import { formatParticipantReason } from '../_utils/formatParticipantReason';
import RecommendationStatBox from '../RecommendationStatBox';

const REVIEW_BACKGROUND_CLASS_NAME =
  '[background:linear-gradient(180deg,rgba(232,233,235,0.50)_0%,rgba(232,233,235,0)_100%),var(--color-grey-50)]';

const FEEDBACK_REASON_OPTIONS = [
  '참석 인원이 너무 적어요',
  '연차를 너무 많이 써야 해요',
  '불확실한 일정이 많이 포함됐어요',
  '추천 기준이 제 상황과 안 맞아요',
] as const;

const FEEDBACK_REASON_OTHER = 'other';

type FeedbackReason =
  | (typeof FEEDBACK_REASON_OPTIONS)[number]
  | typeof FEEDBACK_REASON_OTHER;

const FEEDBACK_REASON_ITEMS: { value: FeedbackReason; label: string }[] = [
  ...FEEDBACK_REASON_OPTIONS.map((value) => ({ value, label: value })),
  { value: FEEDBACK_REASON_OTHER, label: '기타 (직접 입력)' },
];

const FEEDBACK_ICON_ITEMS = [
  {
    value: 'up' as const,
    line: ThumbUpIcon,
    fill: ThumbUpFillIcon,
    label: '도움이 됐어요',
  },
  {
    value: 'down' as const,
    line: ThumbDownIcon,
    fill: ThumbDownFillIcon,
    label: '도움이 안 됐어요',
  },
];

type RecommendationDetailStepProps = {
  roomName: string;
  candidate: RecommendationCandidateDetailT;
  onConfirm: () => void;
};

type ParticipantSectionProps = {
  icon: ReactNode;
  title: string;
  participants: RecommendationParticipantT[];
};

function ParticipantSection({
  icon,
  title,
  participants,
}: ParticipantSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-body-05 text-grey-800">{title}</span>
      </div>
      <ul className="mt-2 rounded-[20px] bg-grey-20/50">
        {participants.map((participant, index) => (
          <li
            key={participant.name}
            className={cn(
              'flex items-center gap-3 p-3',
              index < participants.length - 1 && 'border-b border-grey-50',
            )}
          >
            <Profile
              size="M"
              text={participant.name.slice(1)}
              color={participant.color}
              tone={participant.tone}
            />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <span className="text-body-05 text-grey-800">
                  {participant.name}
                </span>
                {participant.isHost && (
                  <Tag category="icon" color="blue" type="primary" />
                )}
              </div>
              <span className="text-caption-03 text-grey-400">
                {formatParticipantReason(participant.reason)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecommendationDetailStep({
  roomName,
  candidate,
  onConfirm,
}: RecommendationDetailStepProps) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [isFeedbackSheetOpen, setIsFeedbackSheetOpen] = useState(false);
  const [feedbackReason, setFeedbackReason] = useState<FeedbackReason | null>(
    null,
  );
  const [customFeedbackReason, setCustomFeedbackReason] = useState('');

  const resetFeedbackReason = () => {
    setFeedbackReason(null);
    setCustomFeedbackReason('');
  };

  const handleClickFeedbackIcon = (value: 'up' | 'down') => {
    setFeedback((prev) => {
      const next = prev === value ? null : value;
      if (next === 'down') {
        setIsFeedbackSheetOpen(true);
      } else {
        resetFeedbackReason();
      }
      return next;
    });
  };

  const handleFeedbackSheetOpenChange = (open: boolean) => {
    setIsFeedbackSheetOpen(open);
    if (!open) {
      resetFeedbackReason();
    }
  };

  const handleSaveFeedbackReason = () => {
    setIsFeedbackSheetOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mt-4">
        <p className="text-caption-01 text-grey-400">{roomName}</p>
        <p className="text-body-01 text-grey-800">
          {formatDateLabel(candidate.startDate)}
          <span className="text-grey-400"> - </span>
          {formatDateLabel(candidate.endDate)}
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-2 rounded-[20px] bg-blue-50 p-4">
        <div className="flex items-end justify-between">
          <span className="text-caption-03 text-grey-500">참석률</span>
          <span className="text-body-01 text-blue-700">
            {candidate.attendanceRate}%
          </span>
        </div>
        <ProgressBar
          value={candidate.attendanceRate}
          size="lg"
          trackColor="white"
        />
      </div>
      <RecommendationStatBox
        uncertainCount={candidate.uncertainCount}
        partialCount={candidate.partialCount}
        leaveCount={candidate.leaveCount}
        theme="blue"
        className="mt-2"
      />
      <div className="flex flex-col py-9 gap-9">
        <ParticipantSection
          icon={<WarningIcon className="size-5 text-red-300" />}
          title={`주의가 필요한 인원 ${candidate.uncertainParticipants.length}명`}
          participants={candidate.uncertainParticipants}
        />
        <ParticipantSection
          icon={<CompletionIcon className="size-5 text-green-500" />}
          title={`참석 가능한 인원 ${candidate.availableParticipants.length}명`}
          participants={candidate.availableParticipants}
        />
      </div>

      <div
        className={cn(
          '-mx-5 flex flex-col items-center gap-px px-5 pt-8 pb-5 text-center',
          REVIEW_BACKGROUND_CLASS_NAME,
        )}
      >
        <span className="text-caption-01 text-grey-400">
          이 추천이 도움이 되었나요?
        </span>
        <div className="flex items-center gap-3">
          {FEEDBACK_ICON_ITEMS.map(
            ({ value, line: LineIcon, fill: FillIcon, label }) => (
              <IconButton
                key={value}
                icon={
                  feedback === value ? (
                    <FillIcon className="text-grey-400" />
                  ) : (
                    <LineIcon className="text-grey-400" />
                  )
                }
                aria-label={label}
                onClick={() => handleClickFeedbackIcon(value)}
              />
            ),
          )}
        </div>
      </div>

      <div className="mt-auto w-full pt-2 pb-0.5">
        <Button
          text="일정 확정하기"
          type="secondary"
          onClick={onConfirm}
          className="w-full"
        />
      </div>

      <BottomSheet
        open={isFeedbackSheetOpen}
        onOpenChange={handleFeedbackSheetOpenChange}
        title="어떤 점이 아쉬웠나요?"
        description={
          <span className="text-body-06 text-grey-500">
            다음 추천을 더 만족스럽게 만들게요
          </span>
        }
      >
        <ul className="flex flex-col gap-2 px-4 pt-3 pb-1">
          {FEEDBACK_REASON_ITEMS.map((item) => (
            <li key={item.value}>
              <div className="flex items-center gap-3 py-2.5">
                <RadioButton
                  checked={feedbackReason === item.value}
                  onCheckedChange={() => setFeedbackReason(item.value)}
                  className="size-4"
                />
                <span className="text-body-05 text-grey-800">{item.label}</span>
              </div>
              {item.value === FEEDBACK_REASON_OTHER &&
                feedbackReason === FEEDBACK_REASON_OTHER && (
                  <Input
                    value={customFeedbackReason}
                    onChange={(event) =>
                      setCustomFeedbackReason(event.target.value)
                    }
                    placeholder="어떤 점이 아쉬웠는지 적어주세요"
                  />
                )}
            </li>
          ))}
        </ul>
        <div className="px-3 py-4">
          <Button
            text="저장하기"
            type="secondary"
            onClick={handleSaveFeedbackReason}
            disabled={
              !feedbackReason ||
              (feedbackReason === FEEDBACK_REASON_OTHER &&
                !customFeedbackReason.trim())
            }
            className="w-full"
          />
        </div>
      </BottomSheet>
    </div>
  );
}

export default RecommendationDetailStep;
