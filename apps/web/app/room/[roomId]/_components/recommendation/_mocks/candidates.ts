import { RecommendationCandidateDetailT } from '@/types/recommendation';

// TODO: 실제 API 연동 전까지 사용하는 임시 데이터
// 참석률 = round(참여 가능 인원(부분 참여·불확실 일정 포함) / 총 인원 * 100)
// 주의가 필요한 인원 순서: 불가능 → 부분 참여&불확실 일정(동순위), 동순위 내 이름 가나다순
// 참석 가능한 인원 순서: 연차 필요(일수 많은 순) → 정상 참석, 동순위 내 이름 가나다순
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
        reason: { label: '불가능' },
        color: 'yellow',
      },
      {
        name: '박효림',
        isHost: false,
        reason: { label: '부분 참여' },
        color: 'green',
      },
      {
        name: '최정연',
        isHost: false,
        reason: { label: '불확실 일정', days: 2 },
        color: 'purple',
      },
    ],
    availableParticipants: [
      {
        name: '하준수',
        isHost: false,
        reason: { label: '연차 필요', days: 2 },
        color: 'orange',
      },
      {
        name: '김민서',
        isHost: false,
        reason: { label: '정상 참석' },
        color: 'pink',
      },
    ],
  },
  {
    id: 'candidate-2',
    rank: 2,
    startDate: '2026-06-19',
    endDate: '2026-06-22',
    attendanceRate: 60,
    uncertainCount: 1,
    partialCount: 1,
    leaveCount: 0,
    uncertainParticipants: [
      {
        name: '김유정',
        isHost: true,
        reason: { label: '불가능' },
        color: 'yellow',
      },
      {
        name: '박효림',
        isHost: false,
        reason: { label: '불가능' },
        color: 'green',
      },
      {
        name: '최정연',
        isHost: false,
        reason: { label: '부분 참여' },
        color: 'purple',
      },
      {
        name: '하준수',
        isHost: false,
        reason: { label: '불확실 일정' },
        color: 'orange',
      },
    ],
    availableParticipants: [
      {
        name: '김민서',
        isHost: false,
        reason: { label: '정상 참석' },
        color: 'pink',
      },
    ],
  },
  {
    id: 'candidate-3',
    rank: 3,
    startDate: '2026-06-26',
    endDate: '2026-06-29',
    attendanceRate: 80,
    uncertainCount: 0,
    partialCount: 1,
    leaveCount: 1,
    uncertainParticipants: [
      {
        name: '김유정',
        isHost: true,
        reason: { label: '불가능' },
        color: 'yellow',
      },
      {
        name: '박효림',
        isHost: false,
        reason: { label: '부분 참여' },
        color: 'green',
      },
    ],
    availableParticipants: [
      {
        name: '하준수',
        isHost: false,
        reason: { label: '연차 필요', days: 1 },
        color: 'orange',
      },
      {
        name: '김민서',
        isHost: false,
        reason: { label: '정상 참석' },
        color: 'pink',
      },
      {
        name: '최정연',
        isHost: false,
        reason: { label: '정상 참석' },
        color: 'purple',
      },
    ],
  },
];
