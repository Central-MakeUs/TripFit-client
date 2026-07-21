export type ParticipantT = {
  id: number;
  name: string;
  color: 'purple' | 'pink' | 'orange' | 'yellow' | 'green';
  tone?: 1 | 2;
  isHost: boolean;
  isMe: boolean;
};
