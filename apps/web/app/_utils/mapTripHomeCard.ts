import { format } from 'date-fns';

import { TripHomeCardT } from '../_apis/getTrips';

type StatusTagT = { text: string; type: 'secondary' | 'tertiary' };

const MAX_TRIP_TITLE_LENGTH = 15;

export const getTripStatusTag = (trip: TripHomeCardT): StatusTagT | null => {
  if (trip.status === 'CONFIRMED') {
    return { text: '일정 확정', type: 'tertiary' };
  }
  if (trip.status === 'ONGOING') {
    return { text: '조율중', type: 'secondary' };
  }
  return null;
};

export const getTripDateRange = (trip: TripHomeCardT) => {
  const startDate = new Date(trip.startRange);
  const endDate = new Date(trip.endRange);

  if (
    !trip.startRange ||
    !trip.endRange ||
    isNaN(startDate.getTime()) ||
    isNaN(endDate.getTime())
  ) {
    return '미정';
  }

  return `${format(startDate, 'yy.MM.dd')} - ${format(endDate, 'yy.MM.dd')}`;
};

export const truncateTripTitle = (title: string) =>
  title.length > MAX_TRIP_TITLE_LENGTH
    ? `${title.slice(0, MAX_TRIP_TITLE_LENGTH)}...`
    : title;
