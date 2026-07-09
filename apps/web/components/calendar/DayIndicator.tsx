import { VariantProps } from 'class-variance-authority';

import UncertainIcon from '@/assets/icons/schedule-status-uncertain.svg';

import {
  DaySegmentStatus,
  getSegmentKey,
  SEGMENT_ICON_MAP,
} from './dayIndicator.const';
import { daySolidIndicatorStyle } from './dayIndicator.style';

export type DayIndicatorProps =
  | ({ variant: 'solid' } & VariantProps<typeof daySolidIndicatorStyle>)
  | { variant: 'segmented'; status: 'uncertain' }
  | {
      variant: 'segmented';
      status: 'responded';
      morning: DaySegmentStatus;
      afternoon: DaySegmentStatus;
      evening: DaySegmentStatus;
    };

function DayIndicator(props: DayIndicatorProps) {
  if (props.variant === 'solid') {
    return <div className={daySolidIndicatorStyle({ status: props.status })} />;
  }

  if (props.status === 'uncertain') {
    return <UncertainIcon className="h-8 w-8" />;
  }

  const { morning, afternoon, evening } = props;
  const segmentKey = getSegmentKey(morning, afternoon, evening);
  const Icon = SEGMENT_ICON_MAP[segmentKey];

  if (!Icon) {
    return <div className="h-8 w-8 rounded-[99px] bg-grey-50" />;
  }

  return <Icon className="h-8 w-8" />;
}

export default DayIndicator;
