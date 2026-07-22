import { ReactNode } from 'react';

import Profile from '@/components/profile';
import Tag from '@/components/tag';
import { cn } from '@/utils/cn';

import { formatParticipantStatusReason } from '../_utils/formatParticipantStatusReason';
import { ParticipantStatusT } from '../_types/participantStatus';

type ParticipantStatusListProps = {
  icon: ReactNode;
  title: string;
  participants: ParticipantStatusT[];
  titleColorClassName?: string;
  reasonColorClassName?: string;
  listClassName?: string;
};

function ParticipantStatusList({
  icon,
  title,
  participants,
  titleColorClassName = 'text-grey-800',
  reasonColorClassName = 'text-grey-400',
  listClassName = 'mt-2 bg-grey-20/50',
}: ParticipantStatusListProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        {icon}
        <span className={cn('text-body-05', titleColorClassName)}>{title}</span>
      </div>
      <ul className={cn('rounded-[20px]', listClassName)}>
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
                {participant.isMe && (
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-[6px] bg-grey-600 text-[8.5px] font-bold text-white">
                    나
                  </span>
                )}
                <span className="text-body-05 text-grey-800">
                  {participant.name}
                </span>
                {participant.isHost && (
                  <Tag category="icon" color="blue" type="primary" />
                )}
              </div>
              <span className={cn('text-caption-03', reasonColorClassName)}>
                {formatParticipantStatusReason(participant.reason)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ParticipantStatusList;
