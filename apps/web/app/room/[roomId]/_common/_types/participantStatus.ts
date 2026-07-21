export type ParticipantStatusReasonT = {
  label: string;
  days?: number;
};

export type ParticipantStatusT = {
  name: string;
  isHost: boolean;
  isMe?: boolean;
  reason: ParticipantStatusReasonT;
  color: 'purple' | 'pink' | 'orange' | 'yellow' | 'green';
  tone?: 1 | 2;
};
