export type DaySegmentStatusT = 'available' | 'unavailable';

export type DayScheduleValueT = {
  isUncertain: boolean;
  morning: DaySegmentStatusT;
  afternoon: DaySegmentStatusT;
  evening: DaySegmentStatusT;
};

export type RegularScheduleT = {
  id: string;
  days: number[];
  startTime: string;
  endTime: string;
};
