import { ReactNode } from 'react';

import CompletionIcon from '@/assets/icons/completion.svg';
import WarningIcon from '@/assets/icons/warning.svg';
import CtaButtonGroup from '@/components/cta-button-group';
import Profile from '@/components/profile';
import ProgressBar from '@/components/progress-bar';
import {
  RecommendationCandidateDetailT,
  RecommendationParticipantT,
} from '@/types/recommendation';
import { cn } from '@/utils/cn';

import { formatDateLabel } from '../_utils/formatDateLabel';
import { formatParticipantReason } from '../_utils/formatParticipantReason';
import RecommendationFeedback from './_components/RecommendationFeedback';
import RecommendationStatBox from './_components/RecommendationStatBox';

type RecommendationDetailStepProps = {
  roomName: string;
  candidate: RecommendationCandidateDetailT;
  onConfirm: (candidate: RecommendationCandidateDetailT) => void;
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
            key={`${participant.name}-${index}`}
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
                {participant.isHost && (
                  <span className="flex size-4 items-center justify-center rounded-md bg-grey-600 text-[8.5px] leading-4 font-bold tracking-[-0.17px] text-white">
                    나
                  </span>
                )}
                <span className="text-body-05 text-grey-800">
                  {participant.name}
                </span>
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
        <ParticipantSection
          icon={<WarningIcon className="size-5 text-red-300" />}
          title={`주의가 필요한 인원 ${candidate.uncertainParticipants.length}명`}
          participants={candidate.uncertainParticipants}
        />
        <ParticipantSection
          icon={<CompletionIcon className="size-5 text-[#68E494]" />}
          title={`참석 가능한 인원 ${candidate.availableParticipants.length}명`}
          participants={candidate.availableParticipants}
        />
      </div>

      <RecommendationFeedback />

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
