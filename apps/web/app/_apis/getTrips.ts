import { request } from '@/apis/request';
import { MemberPreviewT } from '@/components/room-card';
import { RoomMemberStatusT, RoomStatusT } from '@/types/room';

export type GetTripsRequestT = {
  scope?: 'ongoing' | 'all';
};

export type TripHomeCardT = {
  tripId: string;
  name: string;
  destination: string;
  startRange: string;
  endRange: string;
  durationDays: number | null;
  durationNights: number | null;
  memberCount: number;
  status: RoomStatusT;
  lastActivityAt: string;
  pinned: boolean;
  myRole: 'OWNER' | 'MEMBER';
  myMemberStatus: RoomMemberStatusT;
  activeMemberCount: number;
  memberFillRate: number;
  membersPreview: MemberPreviewT[];
  membersPreviewOverflow: number;
};

export type GetTripsResponseT = {
  trips: TripHomeCardT[];
};

export const getTrips = ({ scope }: GetTripsRequestT) =>
  request<GetTripsResponseT>('/api/v1/trips', {
    method: 'GET',
    params: { scope },
  });
