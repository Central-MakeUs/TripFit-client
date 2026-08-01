import { LandingTypeT } from '@/types/notification';

// landingType은 백엔드 FCM data payload에서 온 문자열이라 알 수 없는 값이 섞일 수 있어
// as로 좁혀도 실제로는 아래 두 값만 매칭되고, 그 외에는 홈으로 안전하게 보낸다.
export const getLandingPath = (landingType: string, tripId: string | null) => {
  const type = landingType as LandingTypeT;

  if (type === 'SCHEDULE_MANAGEMENT') return '/my-schedule';
  if (type === 'TRAVEL_ROOM_DETAIL' && tripId) return `/room/${tripId}`;
  return '/';
};
