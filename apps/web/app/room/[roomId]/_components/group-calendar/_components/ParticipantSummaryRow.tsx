import Button from '@/components/button';
import Profile from '@/components/profile';
import { ParticipantT } from '@/types/participant';

type ParticipantSummaryRowProps = {
  participants: ParticipantT[];
  onRequestResponse: () => void;
};

function ParticipantSummaryRow({
  participants,
  onRequestResponse,
}: ParticipantSummaryRowProps) {
  const [first, ...rest] = participants;

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {participants.map((participant, index) => (
            <div
              key={participant.id}
              className={index === 0 ? '' : '-ml-1'}
              style={{ zIndex: participants.length - index }}
            >
              <Profile
                text={participant.name.slice(1)}
                color={participant.color}
                tone={participant.tone}
              />
            </div>
          ))}
        </div>
        {first && (
          <p className="text-caption-03 text-grey-400">
            {first.name} 외 {rest.length}명
          </p>
        )}
      </div>
      <Button
        text="응답 요청"
        size="M"
        style="outline"
        type="secondary"
        onClick={onRequestResponse}
      />
    </div>
  );
}

export default ParticipantSummaryRow;
