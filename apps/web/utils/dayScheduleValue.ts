import { DayScheduleValueT } from '@/types/schedule';

export const DEFAULT_DAY_VALUE: DayScheduleValueT = {
  isUncertain: false,
  morning: 'available',
  afternoon: 'available',
  evening: 'available',
};

export const areSlotsEqual = (a: DayScheduleValueT, b: DayScheduleValueT) =>
  a.morning === b.morning &&
  a.afternoon === b.afternoon &&
  a.evening === b.evening;
