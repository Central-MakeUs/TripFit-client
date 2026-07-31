import {
  DayOfWeekT,
  RegularScheduleItemT,
  RegularScheduleRequestBodyT,
  VacationApplyPeriodT,
} from '@/apis/regularSchedule';
import { IncludeHalfDayHolidayValueT } from '@/components/basic-info/basicInfo.const';
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

// UI는 "상관없음/1주 전/2주 전/한 달 전"을 일 수(0/7/14/30)로 들고 있다가
// 저장 시점에 API enum으로 변환한다.
const VACATION_APPLY_PERIOD_BY_DAYS: Record<number, VacationApplyPeriodT> = {
  0: 'ANY',
  7: 'ONE_WEEK_BEFORE',
  14: 'TWO_WEEKS_BEFORE',
  30: 'ONE_MONTH_BEFORE',
};

const LEAVE_NOTICE_DAYS_BY_VACATION_APPLY_PERIOD: Record<
  VacationApplyPeriodT,
  number
> = {
  ANY: 0,
  ONE_WEEK_BEFORE: 7,
  TWO_WEEKS_BEFORE: 14,
  ONE_MONTH_BEFORE: 30,
};

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

export const getLeaveNoticeDaysFromRegularSchedules = (
  items: RegularScheduleItemT[],
): number | null =>
  items[0]
    ? LEAVE_NOTICE_DAYS_BY_VACATION_APPLY_PERIOD[items[0].vacationApplyPeriod]
    : null;

export const getIncludeHalfDayHolidayFromRegularSchedules = (
  items: RegularScheduleItemT[],
): IncludeHalfDayHolidayValueT => ({
  halfDay: items[0]?.halfVacationAvailable ?? false,
  holiday: items[0]?.holidayRest ?? false,
});

export const mapClientScheduleToRequestBody = (
  schedule: RegularScheduleT,
  {
    annualLeaveCount,
    leaveNoticeDays,
    includeHalfDayHoliday,
  }: {
    annualLeaveCount: number | null;
    leaveNoticeDays: number | null;
    includeHalfDayHoliday: IncludeHalfDayHolidayValueT;
  },
): RegularScheduleRequestBodyT => ({
  title: DEFAULT_REGULAR_SCHEDULE_TITLE,
  daysOfWeek: daysToDaysOfWeek(schedule.days),
  startTime: toApiTime(schedule.startTime),
  endTime: toApiTime(schedule.endTime),
  maxVacationDays: annualLeaveCount ?? 0,
  vacationApplyPeriod:
    VACATION_APPLY_PERIOD_BY_DAYS[leaveNoticeDays ?? 0] ?? 'ANY',
  halfVacationAvailable: includeHalfDayHoliday.halfDay,
  holidayRest: includeHalfDayHoliday.holiday,
});
