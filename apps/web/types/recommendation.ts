export type RecommendationCandidateT = {
  id: string;
  rank: number;
  startDate: string;
  endDate: string;
  attendanceRate: number;
  uncertainCount: number;
  partialCount: number;
  leaveCount: number;
};
