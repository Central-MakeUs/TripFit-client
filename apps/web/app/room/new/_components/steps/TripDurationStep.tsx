import { useEffect } from 'react';

import ErrorIcon from '@/assets/icons/error.svg';
import Input from '@/components/input';

export type TripDurationValue = {
  nights: string;
  days: string;
};

type TripDurationStepProps = {
  value: TripDurationValue;
  onChange: (value: TripDurationValue) => void;
  periodDays: number | null;
};

const toDigitsOnly = (value: string) => value.replace(/\D/g, '');

export const isTripDurationValid = (
  value: TripDurationValue,
  periodDays: number | null,
): boolean => {
  if (!value.nights || !value.days) return false;

  const nights = Number(value.nights);
  const days = Number(value.days);

  if (days < 1) return false;
  if (periodDays !== null && days > periodDays) return false;
  if (days < nights + 1 || days > nights + 2) return false;

  return true;
};

function TripDurationStep({
  value,
  onChange,
  periodDays,
}: TripDurationStepProps) {
  useEffect(() => {
    if (periodDays === null) return;
    if (value.nights !== '' || value.days !== '') return;
    onChange({ nights: String(periodDays - 1), days: String(periodDays) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodDays]);

  const handleNightsChange = (raw: string) => {
    const nights = toDigitsOnly(raw);
    if (nights === '') {
      onChange({ ...value, nights: '' });
      return;
    }
    const nightsNum = Number(nights);
    const daysNum = value.days === '' ? null : Number(value.days);
    const isDaysStillValid =
      daysNum !== null && daysNum >= nightsNum + 1 && daysNum <= nightsNum + 2;
    onChange({
      nights,
      days: isDaysStillValid ? value.days : String(nightsNum + 1),
    });
  };

  const handleDaysChange = (raw: string) => {
    const days = toDigitsOnly(raw);
    if (days === '') {
      onChange({ ...value, days: '' });
      return;
    }
    const daysNum = Number(days);
    const nightsNum = value.nights === '' ? null : Number(value.nights);
    const isNightsStillValid =
      nightsNum !== null &&
      daysNum >= nightsNum + 1 &&
      daysNum <= nightsNum + 2;
    onChange({
      days,
      nights: isNightsStillValid ? value.nights : String(daysNum - 1),
    });
  };

  const hasBothValues = value.nights !== '' && value.days !== '';
  const hasError = hasBothValues && !isTripDurationValid(value, periodDays);

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
            onChange={(event) => handleNightsChange(event.target.value)}
            error={hasError}
            suffixSlot={<span className="text-body-03 text-grey-500">박</span>}
          />
        </div>
        <div className="h-[1.5px] w-1.5 shrink-0 bg-grey-200" />
        <div className="min-w-0 flex-1">
          <Input
            type="text"
            inputMode="numeric"
            value={value.days}
            onChange={(event) => handleDaysChange(event.target.value)}
            error={hasError}
            suffixSlot={<span className="text-body-03 text-grey-500">일</span>}
          />
        </div>
      </div>
      {hasError && (
        <span className="text-caption-02 mt-1 flex items-center gap-1 text-red-300">
          <ErrorIcon className="h-4 w-4" />
          여행 일수를 다시 확인해주세요
        </span>
      )}
    </div>
  );
}

export default TripDurationStep;
