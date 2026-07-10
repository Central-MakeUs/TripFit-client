type ParticipantCountStepProps = {
  value: number;
  onChange: (value: number) => void;
};

function ParticipantCountStep({ value, onChange }: ParticipantCountStepProps) {
  return (
    <div className="flex flex-1 flex-col">
      <h2 className="text-body-01 pt-3 pb-0.5">몇 명이 함께하나요?</h2>
      <p className="text-caption-01 text-grey-500 pb-7.5">
        여행에 참여할 예상 인원을 입력해주세요.
      </p>
      <div className="flex flex-1 items-center justify-center">
        {/* TODO: 공통 타임피커 컴포넌트로 교체 */}
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="cursor-pointer p-2"
        >
          -
        </button>
        <span className="text-body-01">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="cursor-pointer p-2"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default ParticipantCountStep;
