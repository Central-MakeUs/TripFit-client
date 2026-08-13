'use client';

import { useState } from 'react';
import {
  addDays,
  addYears,
  differenceInCalendarMonths,
  isAfter,
  isBefore,
  startOfToday,
  subDays,
} from 'date-fns';

import ScheduleDayBottomSheet from '@/components/schedule-day-bottom-sheet';
import ScheduleDayNavTitle from '@/components/schedule-day-bottom-sheet/ScheduleDayNavTitle';
import { useInfiniteMonths } from '@/hooks/useInfiniteMonths';
import { DayScheduleValueT } from '@/types/schedule';
import { DEFAULT_DAY_VALUE } from '@/utils/dayScheduleValue';

import ScheduleMonthSection from './ScheduleMonthSection';
import { getDateKey } from './scheduleCalendar.const';

const isSameDayValue = (a: DayScheduleValueT, b: DayScheduleValueT) =>
  a.isUncertain === b.isUncertain &&
  a.morning === b.morning &&
  a.afternoon === b.afternoon &&
  a.evening === b.evening;

type ScheduleCalendarProps = {
  year: number;
  month: number;
  value: Record<string, DayScheduleValueT>;
  onChange: (value: Record<string, DayScheduleValueT>) => void;
  /** 정기 일정 등을 합쳐 계산된 읽기 전용 배경값 — 캘린더에 보여주기만 하고,
   * 사용자가 실제로 건드리기 전까지는 value(저장 대상)에 들어가지 않는다.
   * 한 번 저장한 날짜는 이후 정기 패턴이 바뀌어도 값이 고정되므로, 사용자가
   * 손대지 않은 날짜까지 개별 오버라이드로 저장돼버리는 걸 막기 위함 */
  mergedStatus?: Record<string, DayScheduleValueT>;
  /** 지정하면 이 날짜 이전은 선택할 수 없게 비활성화됨(오늘 이전은 항상 비활성화되며
   * 그보다 나중이면 이 값이 우선함) — 여행방 입장 시 여행 예상 기간으로 캘린더를
   * 제한할 때 사용. 미지정 시 기존처럼 오늘부터 선택 가능 */
  minDate?: Date;
  /** 지정하면 이 날짜 이후는 선택할 수 없게 비활성화됨 — 미지정 시 기존처럼
   * 오늘+2년까지 전체 기간 선택 가능 */
  maxDate?: Date;
};

function ScheduleCalendar({
  year,
  month,
  value,
  onChange,
  mergedStatus,
  minDate,
  maxDate,
}: ScheduleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // 시트 안에서 만지는 동안은 여기(draft)에만 반영하고, "입력하기"를 눌러야
  // 비로소 value(실제 저장 대상)에 커밋한다 — 그냥 토글만 해보고 시트를 닫으면
  // (스와이프, 바깥 탭 등) 아무 것도 저장되지 않아야 하기 때문이다.
  const [draftValue, setDraftValue] = useState<DayScheduleValueT | null>(null);
  // 개인 일정 조회/저장 API가 "오늘~오늘+2년-1일" 구간만 허용하므로,
  // 그 밖의 날짜를 선택해 저장이 거부되는 일이 없도록 스크롤 자체를 여기서 막는다.
  // maxDate(여행 예상 기간 등)가 주어지면 그 범위로 더 좁혀서 막는다.
  const maxScheduleDate = maxDate ?? subDays(addYears(new Date(), 2), 1);
  const effectiveMinDate =
    minDate && isAfter(minDate, startOfToday()) ? minDate : startOfToday();
  // 기준 월이 maxScheduleDate보다 뒤(여행 종료일이 오늘+2년을 넘는 경우 등)면
  // 이 값이 0 이하가 되어 캘린더가 아예 안 보일 수 있으므로 최소 1개월은 보장한다.
  const maxMonthCount = Math.max(
    differenceInCalendarMonths(maxScheduleDate, new Date(year, month - 1, 1)) +
      1,
    1,
  );
  const { months, sentinelRef } = useInfiniteMonths({
    year,
    month,
    maxMonthCount,
  });

  const getBaselineValue = (dateKey: string): DayScheduleValueT =>
    mergedStatus?.[dateKey] ?? DEFAULT_DAY_VALUE;

  const selectedDateKey = selectedDate ? getDateKey(selectedDate) : null;
  const selectedBaselineValue = selectedDateKey
    ? getBaselineValue(selectedDateKey)
    : DEFAULT_DAY_VALUE;
  const selectedValue = draftValue ?? selectedBaselineValue;
  const isSelectedValueUnchanged = isSameDayValue(
    selectedValue,
    selectedBaselineValue,
  );

  const openDay = (date: Date) => {
    const dateKey = getDateKey(date);
    setSelectedDate(date);
    setDraftValue(value[dateKey] ?? getBaselineValue(dateKey));
    setIsSheetOpen(true);
  };

  const handleSubmit = () => {
    if (!selectedDateKey || !draftValue) {
      setIsSheetOpen(false);
      return;
    }

    if (isSameDayValue(draftValue, getBaselineValue(selectedDateKey))) {
      const nextRecord = { ...value };
      delete nextRecord[selectedDateKey];
      onChange(nextRecord);
    } else {
      onChange({ ...value, [selectedDateKey]: draftValue });
    }
    setIsSheetOpen(false);
  };

  const handlePrevDay = () => {
    if (!selectedDate) return;
    const prevDate = subDays(selectedDate, 1);
    if (isBefore(prevDate, effectiveMinDate)) return;
    openDay(prevDate);
  };

  const handleNextDay = () => {
    if (!selectedDate) return;
    const nextDate = addDays(selectedDate, 1);
    if (isAfter(nextDate, maxScheduleDate)) return;
    openDay(nextDate);
  };

  return (
    <div className="flex w-full flex-col gap-7">
      {months.map(({ year: sectionYear, month: sectionMonth }) => (
        <ScheduleMonthSection
          key={`${sectionYear}-${sectionMonth}`}
          year={sectionYear}
          month={sectionMonth}
          value={value}
          mergedStatus={mergedStatus}
          minDate={minDate}
          maxDate={maxScheduleDate}
          selectedDateKey={isSheetOpen ? selectedDateKey : null}
          onSelectDate={openDay}
        />
      ))}
      <div ref={sentinelRef} className="h-1 w-full" />

      {selectedDate && (
        <ScheduleDayBottomSheet
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          title={
            <ScheduleDayNavTitle
              date={selectedDate}
              onPrevDay={handlePrevDay}
              onNextDay={handleNextDay}
              isPrevDisabled={isBefore(
                subDays(selectedDate, 1),
                effectiveMinDate,
              )}
              isNextDisabled={isAfter(
                addDays(selectedDate, 1),
                maxScheduleDate,
              )}
            />
          }
          value={selectedValue}
          onChange={setDraftValue}
          submitDisabled={isSelectedValueUnchanged}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

export default ScheduleCalendar;
