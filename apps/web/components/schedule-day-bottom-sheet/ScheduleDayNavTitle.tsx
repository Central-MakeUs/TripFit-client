import { format } from 'date-fns';

import ArrowLeftIcon from '@/assets/icons/arrow-left-300.svg';
import ArrowRightIcon from '@/assets/icons/arrow-right-300.svg';
import IconButton from '@/components/icon-button';

type ScheduleDayNavTitleProps = {
  date: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  isPrevDisabled?: boolean;
};

function ScheduleDayNavTitle({
  date,
  onPrevDay,
  onNextDay,
  isPrevDisabled,
}: ScheduleDayNavTitleProps) {
  return (
    <div className="flex w-full items-center justify-between px-3 py-2">
      <IconButton
        size="small"
        icon={<ArrowLeftIcon className="text-grey-500" />}
        onClick={onPrevDay}
        disabled={isPrevDisabled}
        aria-label="이전 날짜"
      />
      <span className="text-body-03">{format(date, 'yyyy년 M월 d일')}</span>
      <IconButton
        size="small"
        icon={<ArrowRightIcon className="text-grey-500" />}
        onClick={onNextDay}
        aria-label="다음 날짜"
      />
    </div>
  );
}

export default ScheduleDayNavTitle;
