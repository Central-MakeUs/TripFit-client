import { format, isBefore, startOfToday } from 'date-fns';

import { WEEKDAY_LABELS } from '@/consts/date';
import { useMonthGrid } from '@/hooks/useMonthGrid';
import { DayScheduleValueT } from '@/types/schedule';
import { cn } from '@/utils/cn';

import { getDateKey } from './scheduleCalendar.const';

const hasScheduleData = (dayValue?: DayScheduleValueT) =>
  Boolean(
    dayValue &&
    (dayValue.isUncertain ||
      dayValue.morning === 'unavailable' ||
      dayValue.afternoon === 'unavailable' ||
      dayValue.evening === 'unavailable'),
  );

type ScheduleMonthSectionProps = {
  year: number;
  month: number;
  value: Record<string, DayScheduleValueT>;
  mergedStatus?: Record<string, DayScheduleValueT>;
  selectedDateKey: string | null;
  onSelectDate: (date: Date) => void;
};

function ScheduleMonthSection({
  year,
  month,
  value,
  mergedStatus,
  selectedDateKey,
  onSelectDate,
}: ScheduleMonthSectionProps) {
  const { currentMonth, days, leadingEmptyCount } = useMonthGrid({
    year,
    month,
  });
  const today = startOfToday();

  return (
    <div className="w-full">
      <h3 className="text-body-05 mb-5">
        {format(currentMonth, 'yyyy년 M월')}
      </h3>

      <div className="mb-2 grid grid-cols-7">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-caption-03 flex items-center justify-center text-grey-300"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-3">
        {Array.from({ length: leadingEmptyCount }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {days.map((date) => {
          const dateKey = getDateKey(date);
          const isDisabled = isBefore(date, today);
          const isSelected = selectedDateKey === dateKey;
          const hasData = hasScheduleData(
            value[dateKey] ?? mergedStatus?.[dateKey],
          );
          // TODO: 공휴일 데이터 연동 시 공휴일도 포함
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          if (isDisabled) {
            return (
              <div
                key={dateKey}
                className="flex aspect-square items-center justify-center rounded-lg text-body-06 text-grey-200"
              >
                {date.getDate()}
              </div>
            );
          }

          return (
            <button
              key={dateKey}
              type="button"
              data-date-key={dateKey}
              onClick={() => onSelectDate(date)}
              className="group relative flex aspect-square cursor-pointer items-center justify-center text-body-06"
            >
              <span
                className={cn(
                  'absolute inset-2.5 rounded-lg transition-colors',
                  isSelected ? 'bg-grey-700' : 'group-active:bg-grey-20',
                )}
              />
              <span
                className={cn(
                  'relative',
                  isSelected
                    ? 'text-white'
                    : isWeekend
                      ? 'text-red-300'
                      : 'text-grey-700',
                )}
              >
                {date.getDate()}
              </span>
              <span
                className={cn(
                  'absolute top-1/2 left-1/2 mt-3.5 size-1 -translate-x-1/2 rounded-full',
                  hasData && !isSelected ? 'bg-red-400' : 'bg-transparent',
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ScheduleMonthSection;
