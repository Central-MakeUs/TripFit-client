import { useState } from 'react';

import CheckCircleIcon from '@/assets/icons/check-circle.svg';
import CtaButtonGroup from '@/components/cta-button-group';
import { RecommendationCandidateDetailT } from '@/types/recommendation';

import ShareSheet from '../../../_common/_components/ShareSheet';
import { formatDateLabel } from '../_utils/formatDateLabel';
import RecommendationStatBox from './_components/RecommendationStatBox';

type RecommendationConfirmedStepProps = {
  roomName: string;
  candidate: RecommendationCandidateDetailT;
  onExit: () => void;
};

function RecommendationConfirmedStep({
  roomName,
  candidate,
  onExit,
}: RecommendationConfirmedStepProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <CheckCircleIcon className="h-18 w-18" />
          <span className="text-body-01">여행 일정이 확정됐어요!</span>
        </div>

        <div className="mt-6 flex w-full flex-col items-center rounded-3xl bg-blue-20 px-3 py-4">
          <span className="text-body-01">
            {formatDateLabel(candidate.startDate)}
            <span className="text-grey-400"> - </span>
            {formatDateLabel(candidate.endDate)}
          </span>
          <RecommendationStatBox
            stats={[
              { label: '참석', value: candidate.availableParticipants.length },
              { label: '연차 사용', value: candidate.leaveCount },
              { label: '불확실 일정', value: candidate.uncertainCount },
            ]}
            theme="blue"
            className="mt-4 w-full"
          />
        </div>
      </div>

      <CtaButtonGroup
        primaryText="일정 공유하기"
        primaryColor="secondary"
        onPrimaryClick={() => setIsShareOpen(true)}
        secondaryText="취소하기"
        secondaryVariant="text-link"
        secondaryIcon={false}
        onSecondaryClick={onExit}
        className="px-0"
      />

      <ShareSheet
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        title="확정 일정 공유하기"
        initialTitleValue={`${roomName} 날짜 확정됐어!`}
        initialDescriptionValue={`${formatDateLabel(candidate.startDate)} ~ ${formatDateLabel(candidate.endDate)} 이 날짜 비워둬!`}
        onShare={() => {
          // TODO: 확정 일정 공유 API/카카오톡 공유 연동
          setIsShareOpen(false);
        }}
      />
    </div>
  );
}

export default RecommendationConfirmedStep;
