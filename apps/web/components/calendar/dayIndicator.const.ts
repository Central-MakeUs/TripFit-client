import { FunctionComponent, SVGProps } from 'react';

import AmEveUnavailableIcon from '@/assets/icons/schedule-status-am-eve-unavailable.svg';
import AmPmUnavailableIcon from '@/assets/icons/schedule-status-am-pm-unavailable.svg';
import AmUnavailableIcon from '@/assets/icons/schedule-status-am-unavailable.svg';
import EveUnavailableIcon from '@/assets/icons/schedule-status-eve-unavailable.svg';
import PmEveUnavailableIcon from '@/assets/icons/schedule-status-pm-eve-unavailable.svg';
import PmUnavailableIcon from '@/assets/icons/schedule-status-pm-unavailable.svg';
import UnavailableIcon from '@/assets/icons/schedule-status-unavailable.svg';

export type DaySegmentStatus = 'available' | 'unavailable';

type SegmentKey = `${0 | 1}${0 | 1}${0 | 1}`;

const toSegmentKey = (status: DaySegmentStatus): 0 | 1 =>
  status === 'unavailable' ? 1 : 0;

export const getSegmentKey = (
  morning: DaySegmentStatus,
  afternoon: DaySegmentStatus,
  evening: DaySegmentStatus,
): SegmentKey =>
  `${toSegmentKey(morning)}${toSegmentKey(afternoon)}${toSegmentKey(evening)}`;

export const SEGMENT_ICON_MAP: Partial<
  Record<SegmentKey, FunctionComponent<SVGProps<SVGSVGElement>>>
> = {
  '100': AmUnavailableIcon,
  '010': PmUnavailableIcon,
  '001': EveUnavailableIcon,
  '110': AmPmUnavailableIcon,
  '101': AmEveUnavailableIcon,
  '011': PmEveUnavailableIcon,
  '111': UnavailableIcon,
};
