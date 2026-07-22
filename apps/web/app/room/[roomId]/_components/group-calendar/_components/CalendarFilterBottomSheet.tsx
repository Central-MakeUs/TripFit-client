import BottomSheet from '@/components/bottom-sheet';
import BottomSheetListItem from '@/components/bottom-sheet-list-item';
import Profile from '@/components/profile';
import { ParticipantT } from '@/types/participant';

export type CalendarFilterT = number | 'all';

type CalendarFilterBottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participants: ParticipantT[];
  value: CalendarFilterT;
  onChange: (value: CalendarFilterT) => void;
};

function CalendarFilterBottomSheet({
  open,
  onOpenChange,
  participants,
  value,
  onChange,
}: CalendarFilterBottomSheetProps) {
  const handleSelect = (next: CalendarFilterT) => {
    onChange(next);
    onOpenChange(false);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={<div className="text-body-01 px-4 py-3">필터</div>}
    >
      <div className="flex flex-col gap-1 px-1 pb-3">
        <BottomSheetListItem
          selected={value === 'all'}
          onClick={() => handleSelect('all')}
        >
          전체 보기
        </BottomSheetListItem>
        {participants.map((participant) => (
          <BottomSheetListItem
            key={participant.id}
            selected={value === participant.id}
            onClick={() => handleSelect(participant.id)}
            className="gap-2"
          >
            <Profile
              text={participant.name.slice(1)}
              color={participant.color}
              tone={participant.tone}
            />
            {participant.name}
          </BottomSheetListItem>
        ))}
      </div>
    </BottomSheet>
  );
}

export default CalendarFilterBottomSheet;
