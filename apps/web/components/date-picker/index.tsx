'use client';

import { useInfiniteMonths } from '@/hooks/useInfiniteMonths';

import DatePickerMonthSection from './DatePickerMonthSection';

type DatePickerProps = {
  year: number;
  month: number;
  startDate: Date | null;
  endDate: Date | null;
  onSelectDate: (date: Date) => void;
};

function DatePicker({
  year,
  month,
  startDate,
  endDate,
  onSelectDate,
}: DatePickerProps) {
  const { months, sentinelRef } = useInfiniteMonths({ year, month });

  return (
    <div className="flex w-full flex-col">
      {months.map(({ year: sectionYear, month: sectionMonth }) => (
        <DatePickerMonthSection
          key={`${sectionYear}-${sectionMonth}`}
          year={sectionYear}
          month={sectionMonth}
          startDate={startDate}
          endDate={endDate}
          onSelectDate={onSelectDate}
        />
      ))}
      <div ref={sentinelRef} className="h-1 w-full" />
    </div>
  );
}

export default DatePicker;
