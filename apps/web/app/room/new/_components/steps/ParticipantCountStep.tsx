import AddIcon from '@/assets/icons/add.svg';
import RemoveIcon from '@/assets/icons/remove.svg';
import IconButton from '@/components/icon-button';
import Roulette from '@/components/roulette';

type ParticipantCountStepProps = {
  value: number;
  onChange: (value: number) => void;
};

const PARTICIPANT_COUNT_OPTIONS = Array.from({ length: 21 }, (_, index) =>
  String(index),
);

function ParticipantCountStep({ value, onChange }: ParticipantCountStepProps) {
  const handleDecrement = () => onChange(Math.max(0, value - 1));
  const handleIncrement = () =>
    onChange(Math.min(PARTICIPANT_COUNT_OPTIONS.length - 1, value + 1));

  return (
    <div className="flex flex-1 flex-col">
      <h2 className="text-body-01 pt-3 pb-0.5">몇 명이 함께하나요?</h2>
      <p className="text-caption-01 text-grey-500 pb-7.5">
        여행에 참여할 예상 인원을 입력해주세요.
      </p>
      <div className="flex flex-1 flex-col items-center">
        <div className="w-full" style={{ flexGrow: 93 }} />
        <div className="flex w-full items-center justify-between">
          <IconButton
            size="shadow"
            onClick={handleDecrement}
            aria-label="인원 줄이기"
            icon={<RemoveIcon className="h-full w-full text-grey-500" />}
          />
          <Roulette
            value={String(value)}
            values={PARTICIPANT_COUNT_OPTIONS}
            onChange={(nextValue) => onChange(Number(nextValue))}
          />
          <IconButton
            size="shadow"
            onClick={handleIncrement}
            aria-label="인원 늘리기"
            icon={<AddIcon className="h-full w-full text-grey-500" />}
          />
        </div>
        <div className="w-full" style={{ flexGrow: 226 }} />
      </div>
    </div>
  );
}

export default ParticipantCountStep;
