import { ParticipantStatusReasonT } from '../_types/participantStatus';

export const formatParticipantStatusReason = ({
  label,
  days,
}: ParticipantStatusReasonT) => (days ? `${label}(${days}일)` : label);
