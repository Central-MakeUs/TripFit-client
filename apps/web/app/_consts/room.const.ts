import { RoomCardProps } from '@/components/room-card';

export type RoomFilterT = 'all' | 'ongoing' | 'confirmed';

export type RoomListItemT = {
  dateRange: string;
  filter: Exclude<RoomFilterT, 'all'>;
  id: number;
  isHost: boolean;
  lastActivityAt: string;
  statusTag: string;
  statusTagType: 'secondary' | 'tertiary';
  title: string;
};

export const FILTER_OPTIONS: { label: string; value: RoomFilterT }[] = [
  { label: '전체 보기', value: 'all' },
  { label: '조율 중인 여행', value: 'ongoing' },
  { label: '확정된 여행', value: 'confirmed' },
];

export const ONGOING_ROOM_CARDS: RoomCardProps[] = [
  {
    type: 'fill',
    id: 1,
    title: '제주도 여행',
    isHost: true,
    isPinned: true,
    statusTag: '응답 대기',
    nights: 2,
    days: 3,
    dateRange: '26.07.01 - 26.08.31',
    participants: [
      { name: '민서', color: 'pink' },
      { name: '지혜', color: 'purple' },
      { name: '유정', color: 'yellow' },
      { name: '소윤', color: 'green' },
    ],
    capacity: 5,
    respondedCount: 4,
    progress: 80,
    lastActivityAt: '2026-07-12T09:00:00+09:00',
  },
  {
    type: 'fill',
    id: 2,
    title: '나트랑 여행',
    isHost: true,
    isPinned: false,
    statusTag: '조율중',
    nights: 2,
    days: 3,
    dateRange: '26.07.01 - 26.08.31',
    participants: [
      { name: '민서', color: 'pink' },
      { name: '지혜', color: 'purple' },
      { name: '유정', color: 'yellow' },
      { name: '소윤', color: 'green' },
      { name: '재현', color: 'orange' },
      { name: '하은', color: 'green', tone: 2 },
      { name: '도윤', color: 'yellow', tone: 2 },
    ],
    capacity: 7,
    respondedCount: 7,
    progress: 100,
    lastActivityAt: '2026-07-13T14:00:00+09:00',
  },
  { type: 'empty' },
];

export const ALL_ROOMS: RoomListItemT[] = [
  {
    id: 1,
    title: '제주도 여행',
    dateRange: '26.07.01 - 26.08.31',
    isHost: true,
    statusTag: '조율 중',
    statusTagType: 'secondary',
    filter: 'ongoing',
    lastActivityAt: '2026-07-12T09:00:00+09:00',
  },
  {
    id: 2,
    title: '제주도 여행',
    dateRange: '26.07.01 - 26.08.31',
    isHost: false,
    statusTag: '조율 중',
    statusTagType: 'secondary',
    filter: 'ongoing',
    lastActivityAt: '2026-07-13T14:00:00+09:00',
  },
  {
    id: 3,
    title: '제주도 여행',
    dateRange: '26.07.01 - 26.08.31',
    isHost: false,
    statusTag: '일정 확정',
    statusTagType: 'tertiary',
    filter: 'confirmed',
    lastActivityAt: '2026-07-01T10:00:00+09:00',
  },
  {
    id: 4,
    title: '제주도 여행',
    dateRange: '26.07.01 - 26.08.31',
    isHost: false,
    statusTag: '일정 확정',
    statusTagType: 'tertiary',
    filter: 'confirmed',
    lastActivityAt: '2026-06-20T10:00:00+09:00',
  },
];
