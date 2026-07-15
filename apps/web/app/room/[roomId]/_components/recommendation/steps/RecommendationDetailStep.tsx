import { ReactNode } from 'react';

import CompletionIcon from '@/assets/icons/completion.svg';
import WarningIcon from '@/assets/icons/warning.svg';
import Button from '@/components/button';
import Profile from '@/components/profile';
import ProgressBar from '@/components/progress-bar';
import Tag from '@/components/tag';
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

      <RecommendationFeedback />

      <div className="mt-auto w-full pt-2 pb-0.5">
        <Button
          text="일정 확정하기"
          type="secondary"
          onClick={onConfirm}
          className="w-full"
        />
      </div>
    </div>
  );
}

export default RecommendationDetailStep;
