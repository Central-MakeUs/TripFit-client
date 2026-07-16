import {
  format,
  isBefore,
  isFirstDayOfMonth,
  isLastDayOfMonth,
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
  const today = startOfToday();

  return (
    <div className="w-full pt-4 py-6">
      <h3 className="text-body-03 mb-3">
        {format(currentMonth, 'yyyy년 M월')}
      </h3>

      <div className="grid grid-cols-7 gap-y-3">
        {Array.from({ length: leadingEmptyCount }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {days.map((date) => {
          const isDisabled = isBefore(date, today);
          const isStart = startDate ? isSameDay(date, startDate) : false;
          const isEnd = endDate ? isSameDay(date, endDate) : false;
          const isInRange = Boolean(
            startDate &&
            endDate &&
            isWithinInterval(date, { start: startDate, end: endDate }),
          );
          const isRangeLeftCap =
            isStart || (isInRange && isFirstDayOfMonth(date));
          const isRangeRightCap =
            isEnd || (isInRange && isLastDayOfMonth(date));
          // TODO: 공휴일 데이터 연동 시 공휴일도 포함
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

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
                isRangeLeftCap && 'rounded-l-full',
                isRangeRightCap && 'rounded-r-full',
              )}
            >
              <span
                className={cn(
                  'mx-[0.03rem] flex h-full flex-1 items-center justify-center rounded-full',
                  isStart || isEnd
                    ? 'bg-blue-500 text-white'
                    : isWeekend
                      ? 'text-red-300'
                      : 'text-grey-700',
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
