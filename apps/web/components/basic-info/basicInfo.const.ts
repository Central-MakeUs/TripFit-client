import { IndividualScheduleValueT, RegularScheduleT } from '@/types/schedule';

export type BasicInfoScreen =
  | 'hasRegularSchedule'
  | 'regularScheduleDetail'
  | 'annualLeaveCount'
  | 'leaveNoticeDays'
  | 'includeHalfDayHoliday'
  | 'individualSchedule'
  | 'complete';

// 프로그래스바 표시 단위 — 여러 화면이 하나의 진행 단계로 묶임
export const BASIC_INFO_PROGRESS_STEPS: BasicInfoScreen[][] = [
  ['hasRegularSchedule', 'regularScheduleDetail'],
  ['annualLeaveCount', 'leaveNoticeDays', 'includeHalfDayHoliday'],
  ['individualSchedule'],
  ['complete'],
];

export type BasicInfoValue = {
  hasRegularSchedule: boolean | null;
  regularSchedules: RegularScheduleT[];
  annualLeaveCount: number | null;
  // 0 = 상관없음, 그 외에는 일 단위
  leaveNoticeDays: number | null;
  // TODO: 반차/공휴일 포함 데이터 구조 확정 필요
  includeHalfDayHoliday: boolean | null;
  individualSchedule: IndividualScheduleValueT;
};

export const DEFAULT_BASIC_INFO_VALUE: BasicInfoValue = {
  hasRegularSchedule: null,
  regularSchedules: [],
  annualLeaveCount: null,
  leaveNoticeDays: null,
  includeHalfDayHoliday: null,
  individualSchedule: {},
};

export const LEAVE_NOTICE_DAYS_OPTIONS = [
  { label: '상관없음', value: 0 },
  { label: '1주 전', value: 7 },
  { label: '2주 전', value: 14 },
  { label: '3주 전', value: 21 },
];

export const ANNUAL_LEAVE_COUNT_VALUES = Array.from(
  { length: 31 },
  (_, index) => String(index),
);
