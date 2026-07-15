import { RecommendationParticipantReasonT } from '@/types/recommendation';

export const formatParticipantReason = ({
  label,
  days,
}: RecommendationParticipantReasonT) => (days ? `${label}(${days}일)` : label);
