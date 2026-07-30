import CompletionIcon from '@/assets/icons/completion.svg';
import WarningIcon from '@/assets/icons/warning.svg';
import CtaButtonGroup from '@/components/cta-button-group';
import ProgressBar from '@/components/progress-bar';
import { RecommendationCandidateDetailT } from '@/types/recommendation';

import ParticipantStatusList from '../../../_common/_components/ParticipantStatusList';
import { formatDateLabel } from '../_utils/formatDateLabel';
import RecommendationFeedback from './_components/RecommendationFeedback';
import RecommendationStatBox from './_components/RecommendationStatBox';

type RecommendationDetailStepProps = {
  roomId: string;
  roomName: string;
  candidate: RecommendationCandidateDetailT;
  onConfirm: (candidate: RecommendationCandidateDetailT) => void;
  onFeedbackError: (message: string) => void;
};

function RecommendationDetailStep({
  roomId,
  roomName,
  candidate,
  onConfirm,
  onFeedbackError,
}: RecommendationDetailStepProps) {
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
        stats={[
          { label: '불확실 일정', value: candidate.uncertainCount },
          { label: '부분 참여', value: candidate.partialCount },
          { label: '연차 일수', value: candidate.leaveCount },
        ]}
        theme="blue"
        className="mt-2"
      />
      <div className="flex flex-col py-9 gap-9">
        <ParticipantStatusList
          icon={<WarningIcon className="size-5 text-red-300" />}
          title={`주의가 필요한 인원 ${candidate.uncertainParticipants.length}명`}
          participants={candidate.uncertainParticipants}
        />
        <ParticipantStatusList
          icon={<CompletionIcon className="size-5 text-[#68E494]" />}
          title={`참석 가능한 인원 ${candidate.availableParticipants.length}명`}
          participants={candidate.availableParticipants}
        />
      </div>

      <RecommendationFeedback
        roomId={roomId}
        rank={candidate.rank}
        initialFeedback={candidate.feedback}
        onError={onFeedbackError}
      />

      <CtaButtonGroup
        primaryText="일정 확정하기"
        primaryColor="secondary"
        onPrimaryClick={() => onConfirm(candidate)}
        className="mt-auto px-0"
      />
    </div>
  );
}

export default RecommendationDetailStep;
