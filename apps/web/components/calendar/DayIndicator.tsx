import TravelIcon from '@/assets/icons/travel.svg';
import { cn } from '@/utils/cn';

import { dayIndicatorStyle } from './dayIndicator.style';

export type DayIndicatorProps = {
  status: 'available' | 'partial' | 'unavailable';
};

const ICON_COLOR_CLASS_NAME: Record<DayIndicatorProps['status'], string> = {
  available: 'text-blue-400',
  partial: 'text-blue-20',
  unavailable: '',
};

function DayIndicator({ status }: DayIndicatorProps) {
  return (
    <div className={dayIndicatorStyle({ status })}>
      {status !== 'unavailable' && (
        <TravelIcon
          className={cn('size-full', ICON_COLOR_CLASS_NAME[status])}
        />
      )}
    </div>
  );
}

export default DayIndicator;
