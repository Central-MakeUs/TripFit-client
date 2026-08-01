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
        placeholder="15자 이하"
        maxLength={15}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export default RoomNameStep;
