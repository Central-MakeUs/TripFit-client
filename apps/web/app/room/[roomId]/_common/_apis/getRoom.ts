import { request } from '@/apis/request';
import { RoomStatusT, RoomT } from '@/types/room';

export type GetRoomResponseT = RoomT;

type TripDetailResponse = {
  tripId: string;
  name: string;
  destination: string | null;
  startRange: string;
  endRange: string;
  durationDays: number | null;
  durationNights: number | null;
  memberCount: number;
  inviteCode: string;
  status: RoomStatusT;
  confirmedStartDate: string | null;
  confirmedEndDate: string | null;
  confirmedAttendCount: number | null;
  confirmedVacationMemberCount: number | null;
  confirmedUncertainCount: number | null;
};

export const getRoom = async (roomId: string): Promise<GetRoomResponseT> => {
  const tripResponse = await request<TripDetailResponse>(
    `/api/v1/trips/${roomId}`,
  );

  return {
    id: tripResponse.tripId,
    title: tripResponse.name,
    destination: tripResponse.destination ?? '',
    startDate: tripResponse.startRange,
    endDate: tripResponse.endRange,
    nights: tripResponse.durationNights ?? 0,
    days: tripResponse.durationDays ?? 0,
    memberCount: tripResponse.memberCount,
    inviteCode: tripResponse.inviteCode,
    status: tripResponse.status,
    confirmedStartDate: tripResponse.confirmedStartDate,
    confirmedEndDate: tripResponse.confirmedEndDate,
    confirmedAttendCount: tripResponse.confirmedAttendCount,
    confirmedVacationMemberCount: tripResponse.confirmedVacationMemberCount,
    confirmedUncertainCount: tripResponse.confirmedUncertainCount,
  };
};
