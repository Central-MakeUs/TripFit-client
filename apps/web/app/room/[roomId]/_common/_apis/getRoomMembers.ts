import { request } from '@/apis/request';
import { ParticipantT } from '@/types/participant';

const PARTICIPANT_COLORS: ParticipantT['color'][] = [
  'pink',
  'orange',
  'green',
  'purple',
  'yellow',
];

export type GetRoomMembersResponseT = ParticipantT[];

type TripMemberItem = {
  userId: string;
  displayName: string;
  role: 'OWNER' | 'MEMBER';
  status: 'JOINED' | 'RESPONDED';
};

type TripMembersResponse = {
  members: TripMemberItem[];
};

export const getRoomMembers = async (
  roomId: string,
  userId: string,
): Promise<GetRoomMembersResponseT> => {
  const membersResponse = await request<TripMembersResponse>(
    `/api/v1/trips/${roomId}/members?userId=${userId}`,
  );

  return membersResponse.members.map((member, index) => ({
    id: member.userId,
    name: member.displayName,
    color: PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length] ?? 'pink',
    isHost: member.role === 'OWNER',
    isMe: member.userId === userId,
  }));
};
