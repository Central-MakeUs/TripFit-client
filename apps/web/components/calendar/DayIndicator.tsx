import { VariantProps } from 'class-variance-authority';

import { daySolidIndicatorStyle } from './dayIndicator.style';

type DaySegmentStatus = 'available' | 'unavailable';

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

const segmentColor = (status: DaySegmentStatus) =>
  status === 'unavailable' ? 'var(--color-red-300)' : 'var(--color-red-50)';

function DayIndicator(props: DayIndicatorProps) {
  if (props.variant === 'solid') {
    return <div className={daySolidIndicatorStyle({ status: props.status })} />;
  }

  if (props.status === 'uncertain') {
    return <div className={`h-8 w-8 rounded-full bg-grey-50`} />;
  }

  const { morning, afternoon, evening } = props;

  return (
    <div
      className="h-8 w-8 rounded-full"
      style={{
        background: `conic-gradient(${segmentColor(morning)} 0deg 120deg, ${segmentColor(afternoon)} 120deg 240deg, ${segmentColor(evening)} 240deg 360deg)`,
      }}
    />
  );
}

export default DayIndicator;
