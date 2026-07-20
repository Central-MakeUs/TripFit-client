'use client';

import { TouchEvent, useRef } from 'react';
import { addDays, isSameDay, startOfWeek } from 'date-fns';

import TriangleIcon from '@/assets/icons/triangle.svg';
import { WEEKDAY_LABELS } from '@/components/calendar/calendar.const';
import DayPill from '@/components/calendar/DayPill';
import { DayIndicatorProps } from '@/components/calendar/DayIndicator';
import { cn } from '@/utils/cn';

const SWIPE_THRESHOLD_PX = 40;

type WeekStripProps = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  getIndicatorProps: (date: Date) => DayIndicatorProps;
  isDateDisabled?: (date: Date) => boolean;
};

function WeekStrip({
  selectedDate,
  onSelectDate,
  getIndicatorProps,
  isDateDisabled,
}: WeekStripProps) {
  const touchStartXRef = useRef<number | null>(null);
  const weekStart = startOfWeek(selectedDate);
  const days = Array.from({ length: 7 }, (_, index) =>
    addDays(weekStart, index),
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
    onSelectDate(addDays(selectedDate, deltaX < 0 ? 1 : -1));
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
                'text-caption-06',
                isSelected ? 'text-black' : 'text-grey-400',
              )}
            >
              {WEEKDAY_LABELS[date.getDay()]}
            </span>
            <div className="flex h-3 w-3.25 justify-center pt-px">
              {isSelected && <TriangleIcon />}
            </div>
            <DayPill
              date={date}
              isSelected={isSelected}
              isDisabled={isDisabled}
              indicatorProps={getIndicatorProps(date)}
            />
          </button>
        );
      })}
    </div>
  );
}

export default WeekStrip;
