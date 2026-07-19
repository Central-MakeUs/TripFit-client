import CheckCircleIcon from '@/assets/icons/check-circle.svg';
import CtaButtonGroup from '@/components/cta-button-group';
import { RecommendationCandidateDetailT } from '@/types/recommendation';

import { formatDateLabel } from '../_utils/formatDateLabel';
import RecommendationStatBox from './_components/RecommendationStatBox';

type RecommendationConfirmedStepProps = {
  candidate: RecommendationCandidateDetailT;
  onExit: () => void;
};

function RecommendationConfirmedStep({
  candidate,
  onExit,
}: RecommendationConfirmedStepProps) {
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
        onPrimaryClick={() => {
          /* TODO: 일정 공유하기 플로우 연결 */
        }}
        secondaryText="취소하기"
        secondaryVariant="text-link"
        secondaryIcon={false}
        onSecondaryClick={onExit}
        className="px-0"
      />
    </div>
  );
}

export default RecommendationConfirmedStep;
