import ErrorIcon from '@/assets/icons/error.svg';
import Input from '@/components/input';

export type TripDurationValue = {
  nights: string;
  days: string;
};

type TripDurationStepProps = {
  value: TripDurationValue;
  onChange: (value: TripDurationValue) => void;
};

const toDigitsOnly = (value: string) => value.replace(/\D/g, '');

function TripDurationStep({ value, onChange }: TripDurationStepProps) {
  const isDaysZero = value.days === '0';

  return (
    <div className="flex flex-col">
      <h2 className="text-body-01 pt-3 pb-0.5">
        며칠 정도 여행하고 싶으신가요?
      </h2>
      <p className="text-caption-01 text-grey-500 pb-7.5">
        여행 일수를 알려주시면 그에 맞는 날짜를 찾을게요
      </p>
      <span className="text-body-05 mb-2 block">여행 일수</span>
      <div className="flex items-center gap-1">
        <div className="min-w-0 flex-1">
          <Input
            type="text"
            inputMode="numeric"
            value={value.nights}
            onChange={(event) =>
              onChange({ ...value, nights: toDigitsOnly(event.target.value) })
            }
            error={isDaysZero}
            suffixSlot={<span className="text-body-03 text-grey-500">박</span>}
          />
        </div>
        <div className="h-[1.5px] w-1.5 shrink-0 bg-grey-200" />
        <div className="min-w-0 flex-1">
          <Input
            type="text"
            inputMode="numeric"
            value={value.days}
            onChange={(event) =>
              onChange({ ...value, days: toDigitsOnly(event.target.value) })
            }
            error={isDaysZero}
            suffixSlot={<span className="text-body-03 text-grey-500">일</span>}
          />
        </div>
      </div>
      {isDaysZero && (
        <span className="text-caption-02 mt-1 flex items-center gap-1 text-red-300">
          <ErrorIcon className="h-4 w-4" />
          여행 일수를 다시 확인해주세요
        </span>
      )}
    </div>
  );
}

export default TripDurationStep;
