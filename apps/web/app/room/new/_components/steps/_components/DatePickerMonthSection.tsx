import {
  format,
  isBefore,
  isSameDay,
  isWithinInterval,
  startOfToday,
} from 'date-fns';

import { useMonthGrid } from '@/hooks/useMonthGrid';
import { cn } from '@/utils/cn';

type DatePickerMonthSectionProps = {
  year: number;
  month: number;
  startDate: Date | null;
  endDate: Date | null;
  onSelectDate: (date: Date) => void;
};

function DatePickerMonthSection({
  year,
  month,
  startDate,
  endDate,
  onSelectDate,
}: DatePickerMonthSectionProps) {
  const { currentMonth, days, leadingEmptyCount } = useMonthGrid({
    year,
    month,
  });

  return (
    <div className="w-full">
      <h3 className="text-body-05 mb-5">
        {format(currentMonth, 'yyyy년 M월')}
      </h3>

      <div className="grid grid-cols-7 gap-y-3">
        {Array.from({ length: leadingEmptyCount }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {days.map((date) => {
          const isDisabled = isBefore(date, startOfToday());
          const isStart = Boolean(startDate) && isSameDay(date, startDate!);
          const isEnd = Boolean(endDate) && isSameDay(date, endDate!);
          const isInRange =
            startDate &&
            endDate &&
            isWithinInterval(date, { start: startDate, end: endDate });

          if (isDisabled) {
            return (
              <div
                key={date.toISOString()}
                className="text-body-06 flex aspect-square items-center justify-center text-grey-200"
              >
                {date.getDate()}
              </div>
            );
          }

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelectDate(date)}
              className={cn(
                'text-body-06 flex aspect-square cursor-pointer items-center justify-center',
                isInRange && 'bg-blue-50',
                isStart && 'rounded-l-full',
                isEnd && 'rounded-r-full',
              )}
            >
              <span
                className={cn(
                  'flex aspect-square w-full items-center justify-center rounded-full',
                  isStart || isEnd ? 'bg-blue-500 text-white' : 'text-grey-700',
                )}
              >
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DatePickerMonthSection;
