import Input from '@/components/input';

type DestinationStepProps = {
  value: string;
  onChange: (value: string) => void;
};

function DestinationStep({ value, onChange }: DestinationStepProps) {
  return (
    <div className="flex flex-col">
      <h2 className="text-body-01 pt-3 pb-0.5">어디로 떠날 예정이신가요?</h2>
      <p className="text-caption-01 text-grey-500 pb-7.5">
        아직 정하지 못했다면 나중에 입력해도 괜찮아요.
      </p>
      <Input
        label="여행지"
        placeholder="도시나 나라 이름을 입력해주세요"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export default DestinationStep;
