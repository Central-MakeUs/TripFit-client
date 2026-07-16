import { format } from 'date-fns';

import { WEEKDAY_LABELS } from '@/components/calendar/calendar.const';

type DatePickerTitleProps = {
  startDate: Date | null;
  endDate: Date | null;
};

const formatDate = (date: Date) => format(date, 'yy.MM.dd');

function DatePickerTitle({ startDate, endDate }: DatePickerTitleProps) {
  return (
    <div className="flex w-full flex-col p-4">
      <div className="flex w-full items-center justify-between">
        <span className="text-body-01">여행 시기</span>
        {startDate && endDate && (
          <span className="text-caption-02 text-grey-700">
            {formatDate(startDate)} - {formatDate(endDate)}
          </span>
        )}
      </div>
      <div className="mt-2 grid grid-cols-7">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-caption-03 flex items-center justify-center text-grey-400"
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DatePickerTitle;
