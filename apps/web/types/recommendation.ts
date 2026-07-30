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
  isMe?: boolean;
  reason: RecommendationParticipantReasonT;
  color: 'purple' | 'pink' | 'orange' | 'yellow' | 'green';
  tone?: 1 | 2;
};

export type RecommendationFeedbackReasonT =
  | 'TOO_FEW_ATTENDEES'
  | 'TOO_MANY_VACATION_DAYS'
  | 'TOO_MANY_UNCERTAIN_SCHEDULES'
  | 'CRITERIA_MISMATCH'
  | 'OTHER';

export type RecommendationFeedbackT = {
  status: 'HELPFUL' | 'NOT_HELPFUL';
  reason: RecommendationFeedbackReasonT | null;
  reasonDetail: string | null;
};

export type RecommendationCandidateDetailT = RecommendationCandidateT & {
  uncertainParticipants: RecommendationParticipantT[];
  availableParticipants: RecommendationParticipantT[];
  feedback?: RecommendationFeedbackT | null;
  attendCount?: number;
};

export type RecommendationUnconfirmReasonT =
  | 'NEW_SCHEDULE_ADDED'
  | 'ATTENDEE_AVAILABILITY_CHANGED'
  | 'RECOMMENDATION_UNSATISFACTORY'
  | 'WANT_OTHER_RECOMMENDATION'
  | 'TRIP_PLAN_CHANGED'
  | 'OTHER';
