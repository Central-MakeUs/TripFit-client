'use client';

import { useState } from 'react';

import Button from '@/components/button';
import Header from '@/components/header';
import Input from '@/components/input';
import RadioButton from '@/components/radio-button';
import { RecommendationUnconfirmReasonT } from '@/types/recommendation';

const UNCONFIRM_REASON_ITEMS: {
  value: RecommendationUnconfirmReasonT;
  label: string;
}[] = [
  { value: 'NEW_SCHEDULE_ADDED', label: '새로운 일정이 생겼어요.' },
  {
    value: 'ATTENDEE_AVAILABILITY_CHANGED',
    label: '참석 가능한 인원이 변경되었어요.',
  },
  {
    value: 'RECOMMENDATION_UNSATISFACTORY',
    label: '추천된 일정이 마음에 들지 않아요.',
  },
  {
    value: 'WANT_OTHER_RECOMMENDATION',
    label: '다른 조건으로 다시 추천받고 싶어요.',
  },
  { value: 'TRIP_PLAN_CHANGED', label: '여행 계획이 변경되었어요.' },
  { value: 'OTHER', label: '기타 (직접 입력)' },
];

type RecommendationCancelStepProps = {
  onBack: () => void;
  onSubmit: (
    reason: RecommendationUnconfirmReasonT,
    reasonDetail?: string,
  ) => void;
  isSubmitting?: boolean;
};

function RecommendationCancelStep({
  onBack,
  onSubmit,
  isSubmitting = false,
}: RecommendationCancelStepProps) {
  const [reason, setReason] = useState<RecommendationUnconfirmReasonT | null>(
    null,
  );
  const [reasonDetail, setReasonDetail] = useState('');

  const isSubmitDisabled =
    !reason || (reason === 'OTHER' && !reasonDetail.trim()) || isSubmitting;

  const handleSubmit = () => {
    if (!reason || isSubmitting) return;
    onSubmit(reason, reason === 'OTHER' ? reasonDetail.trim() : undefined);
  };

  return (
    <div className="flex w-full flex-1 flex-col">
      <Header variant="page" title="일정 취소하기" onBack={onBack} />
      <div className="flex w-full flex-1 flex-col px-5 pt-6">
        <h2 className="text-body-01">취소 사유를 알려주세요</h2>
        <ul className="mt-13 flex flex-col gap-2">
          {UNCONFIRM_REASON_ITEMS.map((item) => (
            <li key={item.value}>
              <button
                type="button"
                role="radio"
                aria-checked={reason === item.value}
                onClick={() => setReason(item.value)}
                className="flex w-full cursor-pointer items-center gap-3 py-2.5"
              >
                <RadioButton
                  checked={reason === item.value}
                  interactive={false}
                  className="size-4"
                />
                <span className="text-body-05 text-grey-800">{item.label}</span>
              </button>
              {item.value === 'OTHER' && reason === 'OTHER' && (
                <Input
                  value={reasonDetail}
                  onChange={(event) => setReasonDetail(event.target.value)}
                  placeholder="어떤 점이 아쉬웠는지 적어주세요"
                />
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="px-5 py-2">
        <Button
          text="취소하기"
          type="secondary"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className="w-full"
        />
      </div>
    </div>
  );
}

export default RecommendationCancelStep;
