import { RecommendationCandidate } from '../RecommendationCandidateCard';

// TODO: 실제 API 연동 전까지 사용하는 임시 데이터
export const MOCK_CANDIDATES: RecommendationCandidate[] = [
  {
    id: 'candidate-1',
    rank: 1,
    startDate: '2026-06-12',
    endDate: '2026-06-15',
    attendanceRate: 80,
    uncertainCount: 1,
    partialCount: 1,
    leaveCount: 2,
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
  },
];
