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

export type RecommendationParticipantT = {
  name: string;
  isHost: boolean;
  reason: string;
  color: 'purple' | 'pink' | 'orange' | 'yellow' | 'green';
  tone?: 1 | 2;
};

export type RecommendationCandidateDetailT = RecommendationCandidateT & {
  uncertainParticipants: RecommendationParticipantT[];
  availableParticipants: RecommendationParticipantT[];
};
