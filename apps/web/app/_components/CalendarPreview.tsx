'use client';

import Calendar from '@/components/calendar';
import { format } from 'date-fns';

const DOT_STATUSES = ['empty', 'light', 'full'] as const;

function CalendarPreview() {
  return (
    <Calendar
      year={2026}
      month={7}
      getIndicatorProps={(date) => ({
        variant: 'solid',
        status: DOT_STATUSES[date.getDate() % 3],
      })}
      getHref={(date) => `/room/demo/detail/${format(date, 'yyyy-MM-dd')}`}
    />
  );
}

export default CalendarPreview;
