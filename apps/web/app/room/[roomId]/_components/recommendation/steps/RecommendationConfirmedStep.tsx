import { useState } from 'react';

import CheckCircleMotion from '@/components/check-circle-motion';
import Confetti from '@/components/confetti';
import CtaButtonGroup from '@/components/cta-button-group';

import ShareSheet from '../../../../_common/_components/ShareSheet';
import { formatDateLabel } from '../_utils/formatDateLabel';
import RecommendationStatBox from './_components/RecommendationStatBox';

type RecommendationConfirmedStepProps = {
  roomId: string;
  roomName: string;
  inviteCode: string;
  startDate: string;
  endDate: string;
  attendCount: number;
  leaveCount: number;
  uncertainCount: number;
  onCancel: () => void;
  readOnly?: boolean;
  /** true면 체크마크 주변에 컨페티 연출을 함께 보여줌 — 방금 확정한 직후에만 켠다
   * (이미 확정된 방을 다시 조회해서 보여줄 땐 켜지 않음) */
  showConfetti?: boolean;
};

function RecommendationConfirmedStep({
  roomId,
  roomName,
  inviteCode,
  startDate,
  endDate,
  attendCount,
  leaveCount,
  uncertainCount,
  onCancel,
  readOnly = false,
  showConfetti = false,
}: RecommendationConfirmedStepProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative flex flex-1 flex-col items-center justify-center">
        {showConfetti && <Confetti />}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <CheckCircleMotion className="h-18 w-18" />
          <span className="text-body-01">여행 일정이 확정됐어요!</span>
        </div>

        <div className="relative z-10 mt-6 flex w-full flex-col items-center rounded-3xl bg-blue-20 px-3 py-4">
          <span className="text-body-01">
            {formatDateLabel(startDate)}
            <span className="text-grey-400"> - </span>
            {formatDateLabel(endDate)}
          </span>
          <RecommendationStatBox
            stats={[
              { label: '참석', value: attendCount },
              { label: '연차 사용', value: leaveCount },
              { label: '불확실 일정', value: uncertainCount },
            ]}
            theme="blue"
            className="mt-4 w-full"
          />
        </div>
      </div>

      {!readOnly && (
        <CtaButtonGroup
          primaryText="일정 공유하기"
          primaryColor="secondary"
          onPrimaryClick={() => setIsShareOpen(true)}
          secondaryText="취소하기"
          secondaryVariant="text-link"
          secondaryIcon={false}
          onSecondaryClick={onCancel}
          className="px-0"
        />
      )}

      <ShareSheet
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        title="확정 일정 공유하기"
        initialTitleValue={`${roomName} 날짜 확정됐어!`}
        initialDescriptionValue={`${formatDateLabel(startDate)} ~ ${formatDateLabel(endDate)} 이 날짜 비워둬!`}
        linkPath={`/room/${roomId}?inviteCode=${inviteCode}`}
        buttonTitle="자세히 보기"
        onShare={() => {
          setIsShareOpen(false);
        }}
      />
    </div>
  );
}

export default RecommendationConfirmedStep;
