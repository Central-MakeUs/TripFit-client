export type DaySegmentStatusT = 'available' | 'unavailable';

export type DayScheduleValueT = {
  isUncertain: boolean;
  morning: DaySegmentStatusT;
  afternoon: DaySegmentStatusT;
  evening: DaySegmentStatusT;
};
