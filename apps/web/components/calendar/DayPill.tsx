import { cn } from '@/utils/cn';

import DayIndicator, { DayIndicatorProps } from './DayIndicator';

type DayPillProps = {
  date: Date;
  isSelected: boolean;
  isDisabled?: boolean;
  indicatorProps: DayIndicatorProps;
};

function DayPill({
  date,
  isSelected,
  isDisabled = false,
  indicatorProps,
}: DayPillProps) {
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-0.5 rounded-[99px] p-1',
        isSelected && 'border border-grey-100',
      )}
    >
      <span
        className={cn(
          'text-caption-05',
          isDisabled
            ? 'text-grey-200'
            : isSelected
              ? 'text-black'
              : isWeekend
                ? 'text-red-300'
                : 'text-grey-400',
        )}
      >
        {date.getDate()}
      </span>
      <div className={cn(isDisabled && 'invisible')}>
        <DayIndicator {...indicatorProps} />
      </div>
    </div>
  );
}

export default DayPill;
