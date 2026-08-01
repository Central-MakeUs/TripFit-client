export type TripDurationValue = {
  nights: string;
  days: string;
  /** 지금 nights/days가 자동 채움으로 계산된 값이면 그 계산에 쓰인 periodDays.
   * 부모(RoomCreateForm)가 들고 있는 tripDuration과 함께 저장되므로, 이 화면이
   * 조건부 렌더링으로 언마운트·리마운트돼도 "자동 채움 여부"가 유지된다. */
  autoFilledForPeriodDays?: number;
};

export const isTripDurationValid = (
  value: TripDurationValue,
  periodDays: number | null,
): boolean => {
  if (!value.nights || !value.days) return false;

  const nights = Number(value.nights);
  const days = Number(value.days);

  if (days < 1) return false;
  if (periodDays !== null && days > periodDays) return false;
  // "1박1일"처럼 박 수와 일수가 같은 조합은 실제로 쓰이지 않는다 — 박은
  // 항상 일보다 하루 이상 적어야 한다(0박1일, 2박3일 등).
  if (nights >= days) return false;

  return true;
};
