'use client';

import { TouchEvent, useRef } from 'react';
import { addDays, isSameDay, subDays } from 'date-fns';

import TriangleIcon from '@/assets/icons/triangle.svg';
import DayIndicator, {
  DayIndicatorProps,
} from '@/components/calendar/DayIndicator';
import { WEEKDAY_LABELS } from '@/consts/date';
import { cn } from '@/utils/cn';

const SWIPE_THRESHOLD_PX = 40;

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
  const touchStartXRef = useRef<number | null>(null);
  const rangeStart = subDays(selectedDate, 3);
  const days = Array.from({ length: 7 }, (_, index) =>
    addDays(rangeStart, index),
  );

  const handleTouchStart = (event: TouchEvent) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent) => {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartXRef.current = null;
    if (startX === null || endX === undefined) return;

    const deltaX = endX - startX;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;

    const nextDate = addDays(selectedDate, deltaX < 0 ? 1 : -1);
    if (isDateDisabled?.(nextDate)) return;
    onSelectDate(nextDate);
  };

  return (
    <div
      className="flex w-full items-start justify-between px-5 py-3"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {days.map((date) => {
        const isSelected = isSameDay(date, selectedDate);
        const isDisabled = isDateDisabled?.(date) ?? false;
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        return (
          <button
            key={date.toISOString()}
            type="button"
            disabled={isDisabled}
            onClick={() => onSelectDate(date)}
            className="flex cursor-pointer flex-col items-center gap-0.5 disabled:cursor-not-allowed"
          >
            <span
              className={cn(
                'text-caption-03',
                isSelected ? 'text-black' : 'text-grey-400',
              )}
            >
              {WEEKDAY_LABELS[date.getDay()]}
            </span>
            <div className="flex h-3 w-3.25 justify-center pt-px">
              {isSelected && <TriangleIcon />}
            </div>
            <div
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl p-1',
                isSelected && 'border border-grey-100',
              )}
            >
              <span
                className={cn(
                  'text-caption-03',
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
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default WeekCalendar;
