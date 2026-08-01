import { TripDurationValue } from '../_utils/tripDuration';

const toDigitsOnly = (value: string) => value.replace(/\D/g, '');

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

// 박/일 입력 한 쌍을 서로 어긋나지 않게 묶어준다 — "2박5일"처럼 일수가 박수보다
// 3 이상 많은, 실제로 쓰지 않는 조합을 입력 단계에서부터 막는다.
//
// 편집 중인 필드가 바뀔 때마다 상대 필드를 무조건 "편집값±1"로 재계산하면,
// 이미 유효 범위(±2) 안에 있던 상대 필드 값까지 불필요하게 덮어써 버린다
// (예: 2박3일에서 박만 1로 고치면 일은 그대로 3이어야 하는데 2로 바뀌어버림).
// 그래서 상대 필드는 "지금 값이 이미 유효 범위 안이면 그대로 두고, 벗어날 때만
// 클램프"하고, 상대 필드가 아직 비어있을 때만 자연스러운 기본값(±1)을 채운다.
export const useTripDurationFields = (
  value: TripDurationValue,
  onChange: (value: TripDurationValue) => void,
) => {
  const handleNightsChange = (raw: string) => {
    const digits = toDigitsOnly(raw);

    if (digits === '') {
      onChange({ nights: '', days: value.days });
      return;
    }

    const nights = Number(digits);
    // "1박1일"처럼 박=일이 되는 조합은 없으므로 일의 하한은 항상 박보다 하루 많다.
    const days =
      value.days === ''
        ? nights + 1
        : clamp(Number(value.days), nights + 1, nights + 2);
    onChange({ nights: String(nights), days: String(days) });
  };

  const handleDaysChange = (raw: string) => {
    const digits = toDigitsOnly(raw);

    if (digits === '') {
      onChange({ nights: value.nights, days: '' });
      return;
    }

    const days = Number(digits);
    // 박의 상한은 항상 일보다 하루 적다(박=일 조합 방지).
    const nights =
      value.nights === ''
        ? Math.max(days - 1, 0)
        : clamp(Number(value.nights), Math.max(days - 2, 0), days - 1);
    onChange({ nights: String(nights), days: String(days) });
  };

  return { handleNightsChange, handleDaysChange };
};
