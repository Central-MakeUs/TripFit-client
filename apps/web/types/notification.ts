export type NotificationTypeT =
  | 'PARTICIPANT_JOINED'
  | 'ALL_SCHEDULES_SUBMITTED'
  | 'TRIP_INFO_UPDATED'
  | 'SCHEDULE_CONFIRMED'
  | 'SCHEDULE_UPDATE_REMINDER'
  | 'SCHEDULE_CONFIRM_CANCELED';

export type NotificationT = {
  id: string;
  type: NotificationTypeT;
  roomName: string;
  roomId: string | null;
  message: string;
  createdAt: string;
  isRead: boolean;
};
