'use client';

import { useEffect, useState } from 'react';
import { addDays, isBefore, startOfToday, subDays } from 'date-fns';

import ScheduleDayBottomSheet from '@/components/schedule-day-bottom-sheet';
import ScheduleDayNavTitle from '@/components/schedule-day-bottom-sheet/ScheduleDayNavTitle';
import { useInfiniteMonths } from '@/hooks/useInfiniteMonths';
import { DayScheduleValueT } from '@/types/schedule';

import ScheduleMonthSection from './ScheduleMonthSection';
import { getDateKey } from './scheduleCalendar.const';

const SCROLL_BUFFER_PX = 100;

const DEFAULT_DAY_VALUE: DayScheduleValueT = {
  isUncertain: false,
  morning: 'available',
  afternoon: 'available',
  evening: 'available',
};

type ScheduleCalendarProps = {
  year: number;
  month: number;
  value: Record<string, DayScheduleValueT>;
  onChange: (value: Record<string, DayScheduleValueT>) => void;
};

function ScheduleCalendar({
  year,
  month,
  value,
  onChange,
}: ScheduleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { months, sentinelRef } = useInfiniteMonths({ year, month });

  const selectedDateKey = selectedDate ? getDateKey(selectedDate) : null;
  const selectedValue = selectedDateKey
    ? (value[selectedDateKey] ?? DEFAULT_DAY_VALUE)
    : DEFAULT_DAY_VALUE;

  useEffect(() => {
    if (!isSheetOpen || !selectedDate) return;

    const frame = requestAnimationFrame(() => {
      const dateKey = getDateKey(selectedDate);
      const cell = document.querySelector<HTMLElement>(
        `[data-date-key="${dateKey}"]`,
      );
      const sheet = document.querySelector<HTMLElement>('[data-vaul-drawer]');
      if (!cell || !sheet) return;

      const cellRect = cell.getBoundingClientRect();
      const sheetTop = window.innerHeight - sheet.offsetHeight;
      const hiddenBottomHeight = cellRect.bottom - sheetTop + SCROLL_BUFFER_PX;
      const hiddenTopHeight = SCROLL_BUFFER_PX - cellRect.top;

      if (hiddenBottomHeight > 0) {
        window.scrollBy({ top: hiddenBottomHeight, behavior: 'smooth' });
      } else if (hiddenTopHeight > 0) {
        window.scrollBy({ top: -hiddenTopHeight, behavior: 'smooth' });
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [isSheetOpen, selectedDate]);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setIsSheetOpen(true);
  };

  const handleChangeSelectedValue = (nextValue: DayScheduleValueT) => {
    if (!selectedDateKey) return;
    onChange({ ...value, [selectedDateKey]: nextValue });
  };

  const handlePrevDay = () => {
    if (!selectedDate) return;
    const prevDate = subDays(selectedDate, 1);
    if (isBefore(prevDate, startOfToday())) return;
    setSelectedDate(prevDate);
  };

  const handleNextDay = () => {
    if (!selectedDate) return;
    setSelectedDate(addDays(selectedDate, 1));
  };

  return (
    <div className="flex w-full flex-col gap-7">
      {months.map(({ year: sectionYear, month: sectionMonth }) => (
        <ScheduleMonthSection
          key={`${sectionYear}-${sectionMonth}`}
          year={sectionYear}
          month={sectionMonth}
          value={value}
          selectedDateKey={isSheetOpen ? selectedDateKey : null}
          onSelectDate={handleSelectDate}
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
          onChange={handleChangeSelectedValue}
          onSubmit={() => setIsSheetOpen(false)}
        />
      )}
    </div>
  );
}

export default ScheduleCalendar;
