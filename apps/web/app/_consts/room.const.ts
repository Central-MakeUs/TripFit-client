export type RoomFilterT = 'all' | 'ongoing' | 'confirmed';

export const FILTER_OPTIONS: { label: string; value: RoomFilterT }[] = [
  { label: '전체 보기', value: 'all' },
  { label: '조율 중인 여행', value: 'ongoing' },
  { label: '확정된 여행', value: 'confirmed' },
];
