import { request } from '@/apis/request';
import {
  RecommendationCandidateDetailT,
  RecommendationTypeT,
} from '@/types/recommendation';

type RecommendationModeT = 'BASIC' | 'ALL_ATTEND' | 'SAVE_VACATION' | 'CERTAIN';

const RECOMMENDATION_MODE_MAP: Record<
  RecommendationTypeT,
  RecommendationModeT
> = {
  default: 'BASIC',
  allAttend: 'ALL_ATTEND',
  saveLeave: 'SAVE_VACATION',
  certain: 'CERTAIN',
};

type RecommendationItemResponse = {
  rank: number;
  startDate: string;
  endDate: string;
  attendRate: number;
  partialAttendCount: number;
  uncertainCount: number;
  totalVacationDays: number;
};

type RecommendationListResponse = {
  mode: RecommendationModeT | null;
  items: RecommendationItemResponse[];
};

export const postRecommendations = async (
  roomId: string,
  type: RecommendationTypeT,
): Promise<RecommendationCandidateDetailT[]> => {
  const response = await request<RecommendationListResponse>(
    `/api/v1/trips/${roomId}/recommendations`,
    {
      method: 'POST',
      data: { mode: RECOMMENDATION_MODE_MAP[type] },
    },
  );

  return response.items.map((item) => ({
    id: String(item.rank),
    rank: item.rank,
    startDate: item.startDate,
    endDate: item.endDate,
    attendanceRate: item.attendRate,
    uncertainCount: item.uncertainCount,
    partialCount: item.partialAttendCount,
    leaveCount: item.totalVacationDays,
    availableParticipants: [],
    uncertainParticipants: [],
  }));
};
