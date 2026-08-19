import {
  PatchVacationPolicyRequestT,
  VacationApplyPeriodT,
  VacationPolicyT,
} from '@/apis/vacationPolicy';
import { IncludeHalfDayHolidayValueT } from '@/components/basic-info/basicInfo.const';

// UI는 "상관없음/1주 전/2주 전/한 달 전"을 일 수(0/7/14/30)로 들고 있다가
// 저장 시점에 API enum으로 변환한다. `null`(미설정)과 `ANY`(상관없음 명시 선택)는
// 서로 다른 값이므로 섞지 않는다.
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

export type ClientVacationPolicyValueT = {
  annualLeaveCount: number | null;
  leaveNoticeDays: number | null;
  includeHalfDayHoliday: IncludeHalfDayHolidayValueT;
};

export const mapVacationPolicyToClient = (
  policy: VacationPolicyT,
): ClientVacationPolicyValueT => ({
  annualLeaveCount: policy.maxVacationDays,
  leaveNoticeDays: policy.vacationApplyPeriod
    ? LEAVE_NOTICE_DAYS_BY_VACATION_APPLY_PERIOD[policy.vacationApplyPeriod]
    : null,
  includeHalfDayHoliday: {
    halfDay: policy.halfVacationAvailable,
    holiday: policy.holidayRest,
  },
});

export const mapClientVacationPolicyToRequestBody = ({
  annualLeaveCount,
  leaveNoticeDays,
  includeHalfDayHoliday,
}: ClientVacationPolicyValueT): PatchVacationPolicyRequestT => ({
  maxVacationDays: annualLeaveCount ?? 0,
  vacationApplyPeriod:
    leaveNoticeDays !== null
      ? (VACATION_APPLY_PERIOD_BY_DAYS[leaveNoticeDays] ?? 'ANY')
      : null,
  halfVacationAvailable: includeHalfDayHoliday.halfDay,
  holidayRest: includeHalfDayHoliday.holiday,
});
