export type DaySegmentStatus = 'available' | 'unavailable';

export type ScheduleDateStatus =
  | { status: 'uncertain' }
  | {
      status: 'responded';
      morning: DaySegmentStatus;
      afternoon: DaySegmentStatus;
      evening: DaySegmentStatus;
    };

export const SEGMENT_FIELD_BY_TOOL: Record<
  'morningUnavailable' | 'afternoonUnavailable' | 'eveningUnavailable',
  'morning' | 'afternoon' | 'evening'
> = {
  morningUnavailable: 'morning',
  afternoonUnavailable: 'afternoon',
  eveningUnavailable: 'evening',
};
