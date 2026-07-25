import ArrowDownIcon from '@/assets/icons/arrow-down-200.svg';
import TextButton from '@/components/text-button';
import { cn } from '@/utils/cn';

import { AVAILABILITY_LEGEND_ITEMS } from '../_consts/groupCalendar.const';

type CalendarLegendProps = {
  onClickFilter: () => void;
};

function CalendarLegend({ onClickFilter }: CalendarLegendProps) {
  return (
    <div className="sticky top-0 z-10 flex h-9 w-full items-center justify-between bg-white px-5">
      <TextButton
        text="전체 보기"
        size="S"
        icon={<ArrowDownIcon className="size-4" />}
        onClick={onClickFilter}
        className="px-0"
      />
      <div className="flex items-center gap-2">
        {AVAILABILITY_LEGEND_ITEMS.map((item) => (
          <div key={item.status} className="flex items-center gap-0.5">
            <span className={cn('size-3 rounded-full', item.dotClassName)} />
            <span className="text-caption-06 text-grey-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalendarLegend;
