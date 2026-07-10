'use client';

import {
  format,
  isBefore,
  isSameDay,
  isWithinInterval,
  startOfToday,
} from 'date-fns';

import ArrowLeftIcon from '@/assets/icons/arrow-left-300.svg';
import ArrowRightIcon from '@/assets/icons/arrow-right-300.svg';
import { WEEKDAY_LABELS } from '@/components/calendar/calendar.const';
import { useMonthGrid } from '@/hooks/useMonthGrid';

type RangeCalendarProps = {
  year: number;
  month: number;
  onChangeMonth: (year: number, month: number) => void;
  startDate: Date | null;
  endDate: Date | null;
  onSelectDate: (date: Date) => void;
};

function RangeCalendar({
  year,
  month,
  onChangeMonth,
  startDate,
  endDate,
  onSelectDate,
}: RangeCalendarProps) {
  const {
    currentMonth,
    days,
    leadingEmptyCount,
    handlePrevMonth,
    handleNextMonth,
  } = useMonthGrid({ year, month, onChangeMonth });

  return (
    <div className="w-full">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-1 py-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          aria-label="이전 달"
          className="cursor-pointer justify-self-start p-2.5"
        >
          <ArrowLeftIcon className="h-3 w-3 text-grey-500" />
        </button>
        <span className="text-body-05 justify-self-center text-grey-700">
          {format(currentMonth, 'yyyy년 M월')}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          aria-label="다음 달"
          className="cursor-pointer justify-self-end p-2.5"
        >
          <ArrowRightIcon className="h-3 w-3 text-grey-500" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-x-[5.1%]">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-caption-06 text-grey-400 flex items-center justify-center py-2"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-x-[5.1%] gap-y-1">
        {Array.from({ length: leadingEmptyCount }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {days.map((date) => {
          const isStart = Boolean(startDate) && isSameDay(date, startDate!);
          const isEnd = Boolean(endDate) && isSameDay(date, endDate!);
          const isInRange =
            startDate &&
            endDate &&
            isWithinInterval(date, { start: startDate, end: endDate });
          const isDisabled = isBefore(date, startOfToday());

          if (isDisabled) {
            return (
              <div
                key={date.toISOString()}
                className="text-caption-05 flex h-9 cursor-not-allowed items-center justify-center text-grey-200"
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
              className={`text-caption-05 flex h-9 cursor-pointer items-center justify-center ${isInRange ? 'bg-blue-20 text-blue-500' : 'text-grey-700'}`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center ${isStart || isEnd ? 'rounded-full bg-blue-500 text-white' : ''}`}
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

export default RangeCalendar;
