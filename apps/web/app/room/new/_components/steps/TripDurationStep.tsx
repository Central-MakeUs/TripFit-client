import { useEffect } from 'react';

import ErrorIcon from '@/assets/icons/error.svg';
import Input from '@/components/input';

import { useTripDurationFields } from '../../../_common/_hooks/useTripDurationFields';
import {
  isTripDurationValid,
  TripDurationValue,
} from '../../../_common/_utils/tripDuration';

type TripDurationStepProps = {
  value: TripDurationValue;
  onChange: (value: TripDurationValue) => void;
  periodDays: number | null;
};

// 희망 기간이 이보다 넓으면(몇 주~몇 달 단위의 유연한 기간) 그 기간 전체를 여행
// 일수 기본값으로 채우는 게 말이 안 되므로, 이미 짧게(예: 열흘 이내) 좁혀 고른
// 경우에만 "이미 정확한 날짜를 골랐다"고 보고 그 기간 그대로 자동 채운다.
const MAX_AUTO_FILL_PERIOD_DAYS = 7;

function TripDurationStep({
  value,
  onChange,
  periodDays,
}: TripDurationStepProps) {
  const { handleNightsChange, handleDaysChange } = useTripDurationFields(
    value,
    onChange,
  );
  const hasError =
    !!value.nights && !!value.days && !isTripDurationValid(value, periodDays);

  useEffect(() => {
    if (periodDays === null) return;
    const isAutoFilled = value.autoFilledForPeriodDays !== undefined;
    if (!isAutoFilled && (value.nights !== '' || value.days !== '')) return;
    // 이미 지금 periodDays 기준으로 자동 채움된 값이면 다시 계산할 필요 없다.
    if (value.autoFilledForPeriodDays === periodDays) return;

    if (periodDays > MAX_AUTO_FILL_PERIOD_DAYS) {
      if (isAutoFilled) {
        onChange({ nights: '', days: '' });
      }
      return;
    }

    onChange({
      nights: String(periodDays - 1),
      days: String(periodDays),
      autoFilledForPeriodDays: periodDays,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodDays]);

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
