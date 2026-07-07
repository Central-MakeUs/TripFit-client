'use client';

import { useState } from 'react';

import Calendar from '@/components/calendar';

const DOT_STATUSES = ['empty', 'light', 'full'] as const;

function CalendarPreview() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(7);
  const [clickedDates, setClickedDates] = useState<Record<string, boolean>>({});

  const handleChangeMonth = (nextYear: number, nextMonth: number) => {
    setYear(nextYear);
    setMonth(nextMonth);
  };

  const handleClickDay = (date: Date) => {
    const key = date.toDateString();
    setClickedDates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex w-full flex-col gap-10">
      <Calendar
        year={year}
        month={month}
        onChangeMonth={handleChangeMonth}
        getIndicatorProps={(date) => ({
          variant: 'solid',
          status: DOT_STATUSES[date.getDate() % 3],
        })}
      />
      <Calendar
        year={year}
        month={month}
        onClickDay={handleClickDay}
        getIndicatorProps={(date) => {
          if (clickedDates[date.toDateString()]) {
            return {
              variant: 'segmented',
              status: 'responded',
              morning: 'unavailable',
              afternoon: 'unavailable',
              evening: 'unavailable',
            };
          }

          const remainder = date.getDate() % 9;

          if (remainder === 0) {
            return { variant: 'segmented', status: 'uncertain' };
          }

          const combination = remainder - 1;

          return {
            variant: 'segmented',
            status: 'responded',
            morning: combination & 1 ? 'unavailable' : 'available',
            afternoon: combination & 2 ? 'unavailable' : 'available',
            evening: combination & 4 ? 'unavailable' : 'available',
          };
        }}
      />
    </div>
  );
}

export default CalendarPreview;
