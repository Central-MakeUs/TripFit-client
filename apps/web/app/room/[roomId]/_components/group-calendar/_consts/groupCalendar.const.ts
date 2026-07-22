export type DayAvailabilityStatusT = 'available' | 'partial' | 'unavailable';

export const AVAILABILITY_LEGEND_ITEMS: {
  status: DayAvailabilityStatusT;
  label: string;
  dotClassName: string;
}[] = [
  { status: 'available', label: '모두 가능', dotClassName: 'bg-blue-500' },
  { status: 'partial', label: '부분 가능', dotClassName: 'bg-blue-50' },
  {
    status: 'unavailable',
    label: '완전 불가',
    dotClassName: 'bg-grey-20 ring-1 ring-inset ring-grey-100',
  },
];

// TODO: 실제 API 연동 전까지 사용하는 임시 데이터 — 날짜별로 상태를 섞어서 보여주기 위한 결정론적 패턴
export const getMockDayAvailabilityStatus = (
  date: Date,
): DayAvailabilityStatusT => {
  const pattern: DayAvailabilityStatusT[] = [
    'available',
    'partial',
    'unavailable',
  ];
  return pattern[date.getDate() % pattern.length] ?? 'unavailable';
};
