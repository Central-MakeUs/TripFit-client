import { setHours, setMinutes, subDays } from 'date-fns';

import { NotificationT } from '@/types/notification';

const atHour = (daysAgo: number, hour: number) =>
  setMinutes(setHours(subDays(new Date(), daysAgo), hour), 0).toISOString();

// TODO: 실제 API 연동 전까지 사용하는 임시 데이터
export const MOCK_NOTIFICATIONS: NotificationT[] = [
  {
    id: '1',
    type: 'ALL_SCHEDULES_SUBMITTED',
    roomName: '진격의 여자들',
    roomId: '1',
    message: '모든 참여자의 일정이 제출되었어요!\n추천 일정을 받아보세요.',
    createdAt: atHour(0, 9),
    isRead: false,
  },
  {
    id: '2',
    type: 'PARTICIPANT_JOINED',
    roomName: '진격의 여자들',
    roomId: '1',
    message: '수연님이 여행방에 참여했어요!\n참여 현황을 확인해보세요.',
    createdAt: atHour(0, 8),
    isRead: false,
  },
  {
    id: '3',
    type: 'TRIP_INFO_UPDATED',
    roomName: '여행가즈아',
    roomId: '2',
    message: '여행 정보가 변경되었어요.\n변경된 내용을 확인해보세요.',
    createdAt: atHour(1, 18),
    isRead: true,
  },
  {
    id: '4',
    type: 'SCHEDULE_CONFIRMED',
    roomName: '여행가즈아',
    roomId: '2',
    message: '여행 일정이 확정되었어요!\n확정된 일정을 확인해보세요.',
    createdAt: atHour(1, 12),
    isRead: true,
  },
  {
    id: '5',
    type: 'SCHEDULE_UPDATE_REMINDER',
    roomName: '일정 관리',
    roomId: null,
    message:
      '8월 일정을 업데이트해보세요.\n더 정확한 여행 일정을 추천받을 수 있어요.',
    createdAt: atHour(1, 9),
    isRead: true,
  },
  {
    id: '6',
    type: 'SCHEDULE_CONFIRM_CANCELED',
    roomName: '베이징여행',
    roomId: '3',
    message: '확정된 여행 일정이 취소되었어요. \n다시 일정을 조율해보세요.',
    createdAt: atHour(5, 9),
    isRead: true,
  },
];
