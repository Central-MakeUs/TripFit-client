import CloseCircleIcon from '@/assets/icons/colse-circle.svg';
import Input from '@/components/input';

type RoomNameStepProps = {
  value: string;
  onChange: (value: string) => void;
};

function RoomNameStep({ value, onChange }: RoomNameStepProps) {
  return (
    <div className="flex flex-col">
      <h2 className="text-body-01 pt-3 pb-13">여행방 이름을 입력해주세요</h2>
      <Input
        label="여행방 이름"
        placeholder="00자 이하"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        suffixSlot={
          value && (
            <button
              type="button"
              aria-label="지우기"
              className="cursor-pointer"
              onClick={() => onChange('')}
            >
              <CloseCircleIcon className="h-4 w-4" />
            </button>
          )
        }
      />
    </div>
  );
}

export default RoomNameStep;
