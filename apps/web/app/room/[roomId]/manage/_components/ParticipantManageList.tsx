import AddIcon from '@/assets/icons/add.svg';
import Button from '@/components/button';
import Profile from '@/components/profile';
import Tag from '@/components/tag';
import { ParticipantT } from '@/types/participant';

type ParticipantManageListProps = {
  participants: ParticipantT[];
  capacity: number;
  canRemoveParticipants: boolean;
  onInvite: () => void;
  onRemove: (participant: ParticipantT) => void;
};

function ParticipantManageList({
  participants,
  capacity,
  canRemoveParticipants,
  onInvite,
  onRemove,
}: ParticipantManageListProps) {
  return (
    <div className="flex w-full flex-col gap-3 rounded-[20px] bg-grey-20/50 p-3">
      <div className="flex items-center gap-2">
        <span className="text-caption-02 text-grey-400">참여 인원</span>
        <span className="text-caption-02 text-grey-400">
          {participants.length}/{capacity}
        </span>
      </div>

      <div className="flex flex-col">
        <button
          type="button"
          onClick={onInvite}
          className="flex cursor-pointer items-center gap-3 py-2"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-blue-100">
            <AddIcon className="size-4 text-blue-600" />
          </span>
          <span className="text-body-05 text-blue-700">초대하기</span>
        </button>

        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between py-2"
          >
            <div className="flex items-center gap-3">
              <Profile
                size="M"
                text={participant.name.slice(1)}
                color={participant.color}
                tone={participant.tone}
              />
              <div className="flex items-center gap-1">
                <span className="text-body-05 text-grey-800">
                  {participant.name}
                </span>
                {participant.isHost && (
                  <Tag category="icon" color="blue" type="primary" />
                )}
              </div>
            </div>
            {canRemoveParticipants && !participant.isHost && (
              <Button
                text="내보내기"
                size="M"
                style="weak"
                type="secondary"
                onClick={() => onRemove(participant)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ParticipantManageList;
