import { RoomMemberStatusT } from '@/types/room';

export type ParticipantT = {
  id: string;
  name: string;
  color: 'purple' | 'pink' | 'orange' | 'yellow' | 'green';
  tone?: 1 | 2;
  isHost: boolean;
  isMe: boolean;
  status: RoomMemberStatusT;
};
