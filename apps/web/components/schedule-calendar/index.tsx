'use client';

import { useState } from 'react';
import {
  addDays,
  addYears,
  differenceInCalendarMonths,
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
};

function ScheduleCalendar({
  year,
  month,
  value,
  onChange,
  mergedStatus,
}: ScheduleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // 시트 안에서 만지는 동안은 여기(draft)에만 반영하고, "입력하기"를 눌러야
  // 비로소 value(실제 저장 대상)에 커밋한다 — 그냥 토글만 해보고 시트를 닫으면
  // (스와이프, 바깥 탭 등) 아무 것도 저장되지 않아야 하기 때문이다.
  const [draftValue, setDraftValue] = useState<DayScheduleValueT | null>(null);
  // 개인 일정 조회/저장 API가 "오늘~오늘+2년-1일" 구간만 허용하므로,
  // 그 밖의 날짜를 선택해 저장이 거부되는 일이 없도록 스크롤 자체를 여기서 막는다.
  const maxScheduleDate = subDays(addYears(new Date(), 2), 1);
  const maxMonthCount =
    differenceInCalendarMonths(maxScheduleDate, new Date(year, month - 1, 1)) +
    1;
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
    if (isBefore(prevDate, startOfToday())) return;
    openDay(prevDate);
  };

  const handleNextDay = () => {
    if (!selectedDate) return;
    openDay(addDays(selectedDate, 1));
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
                startOfToday(),
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
