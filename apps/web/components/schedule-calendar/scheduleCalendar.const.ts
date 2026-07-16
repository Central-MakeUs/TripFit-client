export type DaySegmentStatus = 'available' | 'unavailable';

export type DayScheduleValue = {
  isUncertain: boolean;
  morning: DaySegmentStatus;
  afternoon: DaySegmentStatus;
  evening: DaySegmentStatus;
};

export const getDateKey = (date: Date) => date.toDateString();
