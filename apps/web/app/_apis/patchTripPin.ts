import { request } from '@/apis/request';

import { TripHomeCardT } from '@/apis/getTrips';

export type TripDetailT = TripHomeCardT & {
  inviteCode: string | null;
  confirmedStartDate: string | null;
  confirmedEndDate: string | null;
  lastRecommendationMode: string | null;
};

export type PatchTripPinRequestT = {
  tripId: string;
  pinned: boolean;
};

export type PatchTripPinResponseT = TripDetailT;

export const patchTripPin = ({ tripId, pinned }: PatchTripPinRequestT) =>
  request<PatchTripPinResponseT>(`/api/v1/trips/${tripId}/pin`, {
    method: 'PATCH',
    data: { pinned },
  });
