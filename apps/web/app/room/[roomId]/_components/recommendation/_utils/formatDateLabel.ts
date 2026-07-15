import { format } from 'date-fns';

import { WEEKDAY_LABELS } from '@/components/calendar/calendar.const';

export const formatDateLabel = (isoDate: string) => {
  const date = new Date(isoDate);
  return `${format(date, 'M.d')}(${WEEKDAY_LABELS[date.getDay()]})`;
};
