'use client';

import { useEffect, useRef, useState } from 'react';
import { addDays, addMonths, subDays } from 'date-fns';

import ScheduleDayBottomSheet from '@/components/schedule-day-bottom-sheet';
import ScheduleDayNavTitle from '@/components/schedule-day-bottom-sheet/ScheduleDayNavTitle';
import { DayScheduleValueT } from '@/types/schedule';

import ScheduleMonthSection from './ScheduleMonthSection';
import { getDateKey } from './scheduleCalendar.const';

const INITIAL_MONTH_COUNT = 3;
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
  const [monthCount, setMonthCount] = useState(INITIAL_MONTH_COUNT);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const baseMonth = new Date(year, month - 1, 1);
  const months = Array.from({ length: monthCount }, (_, index) => {
    const target = addMonths(baseMonth, index);
    return { year: target.getFullYear(), month: target.getMonth() + 1 };
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setMonthCount((prev) => prev + 1);
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

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

      const cellBottom = cell.getBoundingClientRect().bottom;
      const sheetTop = window.innerHeight - sheet.offsetHeight;
      const hiddenHeight = cellBottom - sheetTop + SCROLL_BUFFER_PX;

      if (hiddenHeight > 0) {
        window.scrollBy({ top: hiddenHeight, behavior: 'smooth' });
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
    setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    if (!selectedDate) return;
    setSelectedDate(addDays(selectedDate, 1));
  };

  return (
    <div className="flex w-full flex-col gap-6">
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
