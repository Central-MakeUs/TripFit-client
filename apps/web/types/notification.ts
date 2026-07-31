export type DeviceTypeT = 'ANDROID' | 'IOS' | 'WEB';

export type NotificationTypeT =
  | 'PARTICIPANT_JOINED'
  | 'ALL_SCHEDULES_SUBMITTED'
  | 'TRIP_INFO_UPDATED'
  | 'SCHEDULE_CONFIRMED'
  | 'SCHEDULE_UPDATE_REMINDER'
  | 'SCHEDULE_CONFIRM_CANCELED';

type NotificationBaseT = {
  id: string;
  roomName: string;
  message: string;
  createdAt: string;
  isRead: boolean;
};

export type NotificationT =
  | (NotificationBaseT & {
      type: Exclude<NotificationTypeT, 'SCHEDULE_UPDATE_REMINDER'>;
      roomId: string;
    })
  | (NotificationBaseT & {
      type: 'SCHEDULE_UPDATE_REMINDER';
      roomId: null;
    });
