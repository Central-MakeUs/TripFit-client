import { FunctionComponent, SVGProps } from 'react';

import AmUnavailableIcon from '@/assets/icons/schedule-status-am-unavailable.svg';
import EveUnavailableIcon from '@/assets/icons/schedule-status-eve-unavailable.svg';
import PmUnavailableIcon from '@/assets/icons/schedule-status-pm-unavailable.svg';
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
  { value: 'morningUnavailable', label: '아침불가', Icon: AmUnavailableIcon },
  { value: 'afternoonUnavailable', label: '점심불가', Icon: PmUnavailableIcon },
  { value: 'eveningUnavailable', label: '저녁불가', Icon: EveUnavailableIcon },
  { value: 'uncertain', label: '불확실', Icon: UncertainIcon },
];
