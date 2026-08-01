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
