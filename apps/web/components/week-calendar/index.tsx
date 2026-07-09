'use client';

import { useEffect, useRef } from 'react';
import { addDays, subDays } from 'date-fns';
import Link from 'next/link';

import TriangleIcon from '@/assets/icons/triangle.svg';
import { WEEKDAY_LABELS } from '@/components/calendar/calendar.const';
import DayIndicator, {
  DayIndicatorProps,
} from '@/components/calendar/DayIndicator';

const SIDE_RANGE_IN_DAYS = 15;
const VISIBLE_DAYS_COUNT = 7;

type WeekCalendarProps = {
  selectedDate: Date;
  getIndicatorProps: (date: Date) => DayIndicatorProps;
  getHref: (date: Date) => string;
};

function WeekCalendar({
  selectedDate,
  getIndicatorProps,
  getHref,
}: WeekCalendarProps) {
  const selectedItemRef = useRef<HTMLAnchorElement>(null);

  const days = Array.from({ length: SIDE_RANGE_IN_DAYS * 2 + 1 }, (_, index) =>
    addDays(subDays(selectedDate, SIDE_RANGE_IN_DAYS), index),
  );

  useEffect(() => {
    selectedItemRef.current?.scrollIntoView({
      behavior: 'instant',
      inline: 'center',
      block: 'nearest',
    });
  }, []);

  return (
    <div className="scrollbar-none flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth py-2">
      {days.map((date) => {
        const isSelected = date.toDateString() === selectedDate.toDateString();
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        const weekdayLabelClassName = isSelected
          ? 'text-black'
          : 'text-grey-400';
        const dateNumberClassName = isSelected
          ? 'text-black'
          : isWeekend
            ? 'text-red-300'
            : 'text-grey-400';

        return (
          <div
            key={date.toISOString()}
            style={{ flex: `0 0 ${100 / VISIBLE_DAYS_COUNT}%` }}
            className="flex snap-center flex-col items-center"
          >
            <span className={`text-caption-06 ${weekdayLabelClassName}`}>
              {WEEKDAY_LABELS[date.getDay()]}
            </span>
            <div className="w-3.25 h-3 pt-px flex justify-center">
              {isSelected && <TriangleIcon />}
            </div>
            <Link
              href={getHref(date)}
              ref={isSelected ? selectedItemRef : undefined}
              className={`flex flex-col items-center gap-0.5 rounded-[99px] p-1 ${isSelected ? 'border border-grey-100' : ''}`}
            >
              <span className={`text-caption-05 ${dateNumberClassName}`}>
                {date.getDate()}
              </span>
              <DayIndicator {...getIndicatorProps(date)} />
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export default WeekCalendar;
