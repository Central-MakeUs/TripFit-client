'use client';

import { ComponentType, SVGProps, useState } from 'react';

import SmileIcon from '@/assets/icons/smile.svg';
import ThumbDownFillIcon from '@/assets/icons/thumb-down-fill-200.svg';
import ThumbDownIcon from '@/assets/icons/thumb-down-line-200.svg';
import ThumbUpFillIcon from '@/assets/icons/thumb-up-fill-200.svg';
import ThumbUpIcon from '@/assets/icons/thumb-up-line-200.svg';
import BottomSheet from '@/components/bottom-sheet';
import Button from '@/components/button';
import IconButton from '@/components/icon-button';
import Input from '@/components/input';
import RadioButton from '@/components/radio-button';
import {
  RecommendationFeedbackReasonT,
  RecommendationFeedbackT,
} from '@/types/recommendation';
import { cn } from '@/utils/cn';

import { usePatchRecommendationFeedback } from '../../_hooks/usePatchRecommendationFeedback';

const REVIEW_BACKGROUND_CLASS_NAME =
  '[background:linear-gradient(180deg,rgba(232,233,235,0.50)_0%,rgba(232,233,235,0)_100%),var(--color-grey-50)]';

const REVIEW_FEEDBACK_SUBMITTED_BACKGROUND_CLASS_NAME =
  '[background:linear-gradient(180deg,rgba(229,244,255,0.50)_0%,rgba(229,244,255,0)_32.68%),var(--color-blue-20)]';

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

const FEEDBACK_REASON_TO_API: Record<
  FeedbackReason,
  RecommendationFeedbackReasonT
> = {
  '참석 인원이 너무 적어요': 'TOO_FEW_ATTENDEES',
  '연차를 너무 많이 써야 해요': 'TOO_MANY_VACATION_DAYS',
  '불확실한 일정이 많이 포함됐어요': 'TOO_MANY_UNCERTAIN_SCHEDULES',
  '추천 기준이 제 상황과 안 맞아요': 'CRITERIA_MISMATCH',
  other: 'OTHER',
};

const API_REASON_TO_FEEDBACK: Record<
  RecommendationFeedbackReasonT,
  FeedbackReason
> = {
  TOO_FEW_ATTENDEES: '참석 인원이 너무 적어요',
  TOO_MANY_VACATION_DAYS: '연차를 너무 많이 써야 해요',
  TOO_MANY_UNCERTAIN_SCHEDULES: '불확실한 일정이 많이 포함됐어요',
  CRITERIA_MISMATCH: '추천 기준이 제 상황과 안 맞아요',
  OTHER: 'other',
};

type FeedbackIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const FEEDBACK_ICON_ITEMS: {
  value: 'up' | 'down';
  line: FeedbackIconComponent;
  fill: FeedbackIconComponent;
  label: string;
}[] = [
  {
    value: 'up',
    line: ThumbUpIcon,
    fill: ThumbUpFillIcon,
    label: '도움이 됐어요',
  },
  {
    value: 'down',
    line: ThumbDownIcon,
    fill: ThumbDownFillIcon,
    label: '도움이 안 됐어요',
  },
];

type RecommendationFeedbackProps = {
  roomId: string;
  rank: number;
  initialFeedback?: RecommendationFeedbackT | null;
  onError: (message: string) => void;
};

function RecommendationFeedback({
  roomId,
  rank,
  initialFeedback,
  onError,
}: RecommendationFeedbackProps) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(
    initialFeedback
      ? initialFeedback.status === 'HELPFUL'
        ? 'up'
        : 'down'
      : null,
  );
  const [isFeedbackSheetOpen, setIsFeedbackSheetOpen] = useState(false);
  const [feedbackReason, setFeedbackReason] = useState<FeedbackReason | null>(
    initialFeedback?.reason
      ? API_REASON_TO_FEEDBACK[initialFeedback.reason]
      : null,
  );
  const [customFeedbackReason, setCustomFeedbackReason] = useState(
    initialFeedback?.reasonDetail ?? '',
  );
  const { patchRecommendationFeedbackMutation } =
    usePatchRecommendationFeedback();

  const isFeedbackSubmitted = feedback !== null && !isFeedbackSheetOpen;

  const resetFeedbackReason = () => {
    setFeedbackReason(null);
    setCustomFeedbackReason('');
  };

  const handleClickFeedbackIcon = (value: 'up' | 'down') => {
    if (value === 'down') {
      setFeedback('down');
      setIsFeedbackSheetOpen(true);
      return;
    }
    patchRecommendationFeedbackMutation(
      { roomId, rank, status: 'HELPFUL' },
      {
        onSuccess: () => setFeedback('up'),
        onError: () => onError('피드백을 저장하지 못했어요'),
      },
    );
  };

  const handleFeedbackSheetOpenChange = (open: boolean) => {
    setIsFeedbackSheetOpen(open);
    if (!open) {
      resetFeedbackReason();
      // 사유를 고르다가 저장 없이 닫으면 실제로는 아무것도 저장되지 않았으므로
      // "제출 완료" 화면으로 보이지 않게 되돌린다.
      setFeedback(null);
    }
  };

  const handleSaveFeedbackReason = () => {
    if (!feedbackReason) return;
    const reason = FEEDBACK_REASON_TO_API[feedbackReason];

    patchRecommendationFeedbackMutation(
      {
        roomId,
        rank,
        status: 'NOT_HELPFUL',
        reason,
        reasonDetail:
          reason === 'OTHER' ? customFeedbackReason.trim() : undefined,
      },
      {
        onSuccess: () => setIsFeedbackSheetOpen(false),
        onError: () => onError('피드백을 저장하지 못했어요'),
      },
    );
  };

  return (
    <div
      className={cn(
        '-mx-5 flex flex-col items-center px-5 pt-8 pb-5 text-center',
        isFeedbackSubmitted
          ? REVIEW_FEEDBACK_SUBMITTED_BACKGROUND_CLASS_NAME
          : REVIEW_BACKGROUND_CLASS_NAME,
      )}
    >
      {isFeedbackSubmitted ? (
        <div className="flex flex-col items-center gap-2">
          <SmileIcon className="size-9 text-blue-500 [&>path:first-child]:text-blue-200" />
          <p className="text-caption-01 text-grey-600">
            소중한 의견 감사합니다.
            <br />더 나은 TripFit을 만드는 데 반영할게요.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
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
      )}

      <BottomSheet
        open={isFeedbackSheetOpen}
        onOpenChange={handleFeedbackSheetOpenChange}
        title={
          <div className="flex flex-col gap-0.5 p-4">
            <span className="text-body-01">어떤 점이 아쉬웠나요?</span>
            <span className="text-body-06 text-grey-500">
              다음 추천을 더 만족스럽게 만들게요
            </span>
          </div>
        }
      >
        <ul className="flex flex-col gap-2 px-4 pt-3 pb-1">
          {FEEDBACK_REASON_ITEMS.map((item) => (
            <li key={item.value}>
              <button
                type="button"
                role="radio"
                aria-checked={feedbackReason === item.value}
                onClick={() => setFeedbackReason(item.value)}
                className="flex w-full cursor-pointer items-center gap-3 py-2.5"
              >
                <RadioButton
                  checked={feedbackReason === item.value}
                  interactive={false}
                  className="size-4"
                />
                <span className="text-body-05 text-grey-800">{item.label}</span>
              </button>
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

export default RecommendationFeedback;
