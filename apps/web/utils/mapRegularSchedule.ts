import {
  DayOfWeekT,
  RegularScheduleItemT,
  RegularScheduleRequestBodyT,
} from '@/apis/regularSchedule';
import { RegularScheduleT } from '@/types/schedule';

// UI의 days는 일(0)~토(6) 인덱스, API의 daysOfWeek는 월요일부터 시작하는 Weekday CSV다.
const WEEKDAY_BY_DAY_INDEX: Record<number, DayOfWeekT> = {
  0: 'SUN',
  1: 'MON',
  2: 'TUE',
  3: 'WED',
  4: 'THU',
  5: 'FRI',
  6: 'SAT',
};

const DAY_INDEX_BY_WEEKDAY: Record<DayOfWeekT, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

const daysToDaysOfWeek = (days: number[]): string =>
  [...days]
    .sort((a, b) => a - b)
    .map((day) => WEEKDAY_BY_DAY_INDEX[day])
    .join(',');

const daysOfWeekToDays = (daysOfWeek: string): number[] =>
  daysOfWeek
    .split(',')
    .map((weekday) => DAY_INDEX_BY_WEEKDAY[weekday as DayOfWeekT]);

// UI는 "HH:mm", API는 초 단위까지 포함한 "HH:mm:ss"를 쓴다.
const toApiTime = (time: string): string => `${time}:00`;
const fromApiTime = (time: string): string => time.slice(0, 5);

// 정기 일정 항목 이름을 입력받는 UI가 없어 고정값으로 보낸다.
const DEFAULT_REGULAR_SCHEDULE_TITLE = '출근';

export const mapRegularScheduleItemToClient = (
  item: RegularScheduleItemT,
): RegularScheduleT => ({
  id: item.id,
  days: daysOfWeekToDays(item.daysOfWeek),
  startTime: fromApiTime(item.startTime),
  endTime: fromApiTime(item.endTime),
});

export const mapClientScheduleToRequestBody = (
  schedule: RegularScheduleT,
): RegularScheduleRequestBodyT => ({
  title: DEFAULT_REGULAR_SCHEDULE_TITLE,
  daysOfWeek: daysToDaysOfWeek(schedule.days),
  startTime: toApiTime(schedule.startTime),
  endTime: toApiTime(schedule.endTime),
});
