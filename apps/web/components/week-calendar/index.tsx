'use client';

import { useEffect, useRef } from 'react';
import { addDays, isSameDay, subDays } from 'date-fns';

import TriangleIcon from '@/assets/icons/triangle.svg';
import { WEEKDAY_LABELS } from '@/components/calendar/calendar.const';
import DayIndicator, {
  DayIndicatorProps,
} from '@/components/calendar/DayIndicator';
import { cn } from '@/utils/cn';

const SIDE_RANGE_IN_DAYS = 15;
const VISIBLE_DAYS_COUNT = 7;

type WeekCalendarProps = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  getIndicatorProps: (date: Date) => DayIndicatorProps;
  isDateDisabled?: (date: Date) => boolean;
};

function WeekCalendar({
  selectedDate,
  onSelectDate,
  getIndicatorProps,
  isDateDisabled,
}: WeekCalendarProps) {
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  const days = Array.from({ length: SIDE_RANGE_IN_DAYS * 2 + 1 }, (_, index) =>
    addDays(subDays(selectedDate, SIDE_RANGE_IN_DAYS), index),
  );
  const selectedDateKey = selectedDate.toDateString();

  useEffect(() => {
    selectedItemRef.current?.scrollIntoView({
      behavior: 'instant',
      inline: 'center',
      block: 'nearest',
    });
  }, [selectedDateKey]);

  return (
    <div className="scrollbar-none flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth py-2">
      {days.map((date) => {
        const isSelected = isSameDay(date, selectedDate);
        const isDisabled = isDateDisabled?.(date) ?? false;
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        return (
          <div
            key={date.toISOString()}
            style={{ flex: `0 0 ${100 / VISIBLE_DAYS_COUNT}%` }}
            className="flex snap-center flex-col items-center"
          >
            <span
              className={cn(
                'text-caption-06',
                isSelected ? 'text-black' : 'text-grey-400',
              )}
            >
              {WEEKDAY_LABELS[date.getDay()]}
            </span>
            <div className="w-3.25 h-3 pt-px flex justify-center">
              {isSelected && <TriangleIcon />}
            </div>
            <button
              type="button"
              ref={isSelected ? selectedItemRef : undefined}
              disabled={isDisabled}
              onClick={() => onSelectDate(date)}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-0.5 rounded-[99px] p-1 disabled:cursor-not-allowed',
                isSelected && 'border border-grey-100',
              )}
            >
              <span
                className={cn(
                  'text-caption-05',
                  isDisabled
                    ? 'text-grey-200'
                    : isSelected
                      ? 'text-black'
                      : isWeekend
                        ? 'text-red-300'
                        : 'text-grey-400',
                )}
              >
                {date.getDate()}
              </span>
              <div className={cn(isDisabled && 'invisible')}>
                <DayIndicator {...getIndicatorProps(date)} />
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default WeekCalendar;
