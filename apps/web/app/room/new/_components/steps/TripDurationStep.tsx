import { useEffect, useRef } from 'react';

import Input from '@/components/input';

export type TripDurationValue = {
  nights: string;
  days: string;
  /** 지금 nights/days가 자동 채움으로 계산된 값이면 그 계산에 쓰인 periodDays.
   * 부모(RoomCreateForm)가 들고 있는 tripDuration과 함께 저장되므로, 이 화면이
   * 조건부 렌더링으로 언마운트·리마운트돼도 "자동 채움 여부"가 유지된다. */
  autoFilledForPeriodDays?: number;
};

type TripDurationStepProps = {
  value: TripDurationValue;
  onChange: (value: TripDurationValue) => void;
  periodDays: number | null;
};

// 희망 기간이 이보다 넓으면(몇 주~몇 달 단위의 유연한 기간) 그 기간 전체를 여행
// 일수 기본값으로 채우는 게 말이 안 되므로, 이미 짧게(예: 열흘 이내) 좁혀 고른
// 경우에만 "이미 정확한 날짜를 골랐다"고 보고 그 기간 그대로 자동 채운다.
const MAX_AUTO_FILL_PERIOD_DAYS = 7;

const toDigitsOnly = (value: string) => value.replace(/\D/g, '');

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

export const isTripDurationValid = (
  value: TripDurationValue,
  periodDays: number | null,
): boolean => {
  if (!value.nights || !value.days) return false;

  const nights = Number(value.nights);
  const days = Number(value.days);

  if (days < 1) return false;
  if (periodDays !== null && days > periodDays) return false;
  // 0박(당일치기)은 항상 허용하고, 그 외에는 박 수가 일수를 넘지만 않으면
  // 허용한다(2박3일, 3박3일 등 실제로 쓰이는 표현을 폭넓게 허용).
  if (nights > days) return false;

  return true;
};

function TripDurationStep({
  value,
  onChange,
  periodDays,
}: TripDurationStepProps) {
  // 박/일 중 사용자가 지금 직접 타이핑하고 있는(=상대 필드를 종속시키는) 쪽.
  // 이 필드를 편집하면 상대 필드가 그에 맞춰 자동으로 바뀌고, 반대로 상대
  // 필드를 편집하면 이 필드는 그대로 둔 채 그 값 기준 ±범위 안에서만 허용한다.
  // (이 값 자체는 같은 렌더 사이클 안에서의 입력 우선순위만 다루므로 리마운트에
  // 영향받아도 문제없어 로컬 ref로 충분하다)
  const syncSourceRef = useRef<'nights' | 'days' | null>(null);

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

  const handleNightsChange = (raw: string) => {
    const digits = toDigitsOnly(raw);

    if (digits === '') {
      syncSourceRef.current = null;
      onChange({ nights: '', days: value.days });
      return;
    }

    // 일(days)이 이미 입력 기준이면 박은 그 값의 -2~0 범위 안에서만 자유
    // 입력을 허용하고, 일은 건드리지 않는다.
    if (syncSourceRef.current === 'days' && value.days !== '') {
      const days = Number(value.days);
      const nights = clamp(Number(digits), Math.max(days - 2, 0), days);
      onChange({ nights: String(nights), days: value.days });
      return;
    }

    syncSourceRef.current = 'nights';
    const nights = Number(digits);
    onChange({ nights: String(nights), days: String(nights + 1) });
  };

  const handleDaysChange = (raw: string) => {
    const digits = toDigitsOnly(raw);

    if (digits === '') {
      syncSourceRef.current = null;
      onChange({ nights: value.nights, days: '' });
      return;
    }

    // 박(nights)이 이미 입력 기준이면 일은 그 값의 0~+2 범위 안에서만 자유
    // 입력을 허용하고, 박은 건드리지 않는다.
    if (syncSourceRef.current === 'nights' && value.nights !== '') {
      const nights = Number(value.nights);
      const days = clamp(Number(digits), Math.max(nights, 1), nights + 2);
      onChange({ nights: value.nights, days: String(days) });
      return;
    }

    syncSourceRef.current = 'days';
    const days = Number(digits);
    onChange({ nights: String(Math.max(days - 1, 0)), days: String(days) });
  };

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
            suffixSlot={<span className="text-body-03 text-grey-500">일</span>}
          />
        </div>
      </div>
    </div>
  );
}

export default TripDurationStep;
