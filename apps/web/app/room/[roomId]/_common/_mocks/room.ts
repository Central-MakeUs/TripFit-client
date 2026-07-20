import { ParticipantT } from '@/types/participant';
import { RoomT } from '@/types/room';

// TODO: 실제 API 연동 전까지 사용하는 임시 데이터
export const MOCK_ROOM: RoomT = {
  id: 1,
  title: '제주도 여행',
  startDate: '2026-07-01',
  endDate: '2026-08-31',
  nights: 2,
  days: 3,
  destination: '',
  hostId: 1,
};

export const MOCK_ROOM_CAPACITY = 5;

export const MOCK_PARTICIPANTS: ParticipantT[] = [
  { id: 1, name: '김민서', color: 'pink', isHost: true, isMe: true },
  { id: 2, name: '박효림', color: 'orange', isHost: false, isMe: false },
  { id: 3, name: '최정연', color: 'green', isHost: false, isMe: false },
  { id: 4, name: '하준수', color: 'purple', isHost: false, isMe: false },
];
