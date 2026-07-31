export type DeviceTypeT = 'ANDROID' | 'IOS' | 'WEB';

export type LandingTypeT = 'TRAVEL_ROOM_DETAIL' | 'SCHEDULE_MANAGEMENT';

export type NotificationTypeT =
  | 'JOIN_COMPLETED'
  | 'ALL_MEMBERS_SUBMITTED'
  | 'TRIP_INFO_CHANGED'
  | 'TRIP_CONFIRMED'
  | 'TRIP_CONFIRM_CANCELED'
  | 'SCHEDULE_REMINDER';

export type NotificationT = {
  id: string;
  type: NotificationTypeT;
  title: string;
  body: string;
  landingType: LandingTypeT;
  // 여행방과 무관한 알림(정기 리마인드)은 tripId/roomName이 null이다.
  tripId: string | null;
  roomName: string | null;
  isRead: boolean;
  sentAt: string;
};
