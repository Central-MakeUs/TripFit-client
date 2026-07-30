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

export const getTripDateRange = (trip: TripHomeCardT) =>
  `${format(new Date(trip.startRange), 'yy.MM.dd')} - ${format(new Date(trip.endRange), 'yy.MM.dd')}`;

export const truncateTripTitle = (title: string) =>
  title.length > MAX_TRIP_TITLE_LENGTH
    ? `${title.slice(0, MAX_TRIP_TITLE_LENGTH)}...`
    : title;
