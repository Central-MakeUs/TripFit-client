import { RecommendationCandidateDetailT } from '@/types/recommendation';

// TODO: 실제 API 연동 전까지 사용하는 임시 데이터
export const MOCK_CANDIDATES: RecommendationCandidateDetailT[] = [
  {
    id: 'candidate-1',
    rank: 1,
    startDate: '2026-06-12',
    endDate: '2026-06-15',
    attendanceRate: 80,
    uncertainCount: 1,
    partialCount: 1,
    leaveCount: 2,
    uncertainParticipants: [
      {
        name: '김유정',
        isHost: true,
        reason: '불가능',
        color: 'yellow',
      },
      {
        name: '박효림',
        isHost: false,
        reason: '부분 참여',
        color: 'green',
      },
      {
        name: '최정연',
        isHost: false,
        reason: '불확실 일정(2일), 연차 필요(2일)',
        color: 'purple',
      },
    ],
    availableParticipants: [
      {
        name: '하준수',
        isHost: false,
        reason: '연차 필요(2일)',
        color: 'orange',
      },
      { name: '김민서', isHost: false, reason: '정상 참석', color: 'pink' },
    ],
  },
  {
    id: 'candidate-2',
    rank: 2,
    startDate: '2026-06-19',
    endDate: '2026-06-22',
    attendanceRate: 70,
    uncertainCount: 2,
    partialCount: 1,
    leaveCount: 3,
    uncertainParticipants: [
      {
        name: '김소은',
        isHost: true,
        reason: '일정 미정',
        color: 'purple',
      },
      {
        name: '이준혁',
        isHost: false,
        reason: '부분 참여',
        color: 'orange',
      },
      {
        name: '박지민',
        isHost: false,
        reason: '불가능',
        color: 'pink',
      },
    ],
    availableParticipants: [
      { name: '최수아', isHost: false, reason: '참석 가능', color: 'yellow' },
    ],
  },
  {
    id: 'candidate-3',
    rank: 3,
    startDate: '2026-06-26',
    endDate: '2026-06-29',
    attendanceRate: 60,
    uncertainCount: 2,
    partialCount: 2,
    leaveCount: 2,
    uncertainParticipants: [
      {
        name: '이준혁',
        isHost: false,
        reason: '불가능',
        color: 'orange',
      },
      {
        name: '박지민',
        isHost: false,
        reason: '부분 참여',
        color: 'pink',
      },
    ],
    availableParticipants: [
      { name: '김소은', isHost: true, reason: '참석 가능', color: 'purple' },
      { name: '최수아', isHost: false, reason: '참석 가능', color: 'yellow' },
    ],
  },
];
