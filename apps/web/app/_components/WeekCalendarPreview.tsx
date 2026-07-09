'use client';

import { format } from 'date-fns';

import WeekCalendar from '@/components/week-calendar';

const DOT_STATUSES = ['empty', 'light', 'full'] as const;

function WeekCalendarPreview() {
  return (
    <WeekCalendar
      selectedDate={new Date()}
      getIndicatorProps={(date) => ({
        variant: 'solid',
        status: DOT_STATUSES[date.getDate() % 3],
      })}
      getHref={(date) => `/room/demo/detail/${format(date, 'yyyy-MM-dd')}`}
    />
  );
}

export default WeekCalendarPreview;
