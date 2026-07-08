import { FunctionComponent, SVGProps } from 'react';

import AfternoonUnavailableIcon from '@/assets/icons/schedule-status-afternoon-unavailable.svg';
import EveningUnavailableIcon from '@/assets/icons/schedule-status-evening-unavailable.svg';
import MorningUnavailableIcon from '@/assets/icons/schedule-status-morning-unavailable.svg';
import UncertainIcon from '@/assets/icons/schedule-status-uncertain.svg';
import UnavailableIcon from '@/assets/icons/schedule-status-unavailable.svg';

export type ScheduleStatusOption =
  | 'unavailable'
  | 'morningUnavailable'
  | 'afternoonUnavailable'
  | 'eveningUnavailable'
  | 'uncertain';

export const SCHEDULE_STATUS_OPTIONS: {
  value: ScheduleStatusOption;
  label: string;
  Icon: FunctionComponent<SVGProps<SVGSVGElement>>;
}[] = [
  { value: 'unavailable', label: '불가능', Icon: UnavailableIcon },
  {
    value: 'morningUnavailable',
    label: '아침불가',
    Icon: MorningUnavailableIcon,
  },
  {
    value: 'afternoonUnavailable',
    label: '점심불가',
    Icon: AfternoonUnavailableIcon,
  },
  {
    value: 'eveningUnavailable',
    label: '저녁불가',
    Icon: EveningUnavailableIcon,
  },
  { value: 'uncertain', label: '불확실', Icon: UncertainIcon },
];
