export type RecommendationTypeT =
  | 'default'
  | 'allAttend'
  | 'saveLeave'
  | 'certain';

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

export type RecommendationParticipantReasonT = {
  label: string;
  days?: number;
};

export type RecommendationParticipantT = {
  name: string;
  isHost: boolean;
  reason: RecommendationParticipantReasonT;
  color: 'purple' | 'pink' | 'orange' | 'yellow' | 'green';
  tone?: 1 | 2;
};

export type RecommendationCandidateDetailT = RecommendationCandidateT & {
  uncertainParticipants: RecommendationParticipantT[];
  availableParticipants: RecommendationParticipantT[];
};
