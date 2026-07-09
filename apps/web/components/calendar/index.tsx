'use client';

import { ReactNode } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from 'date-fns';

import { WEEKDAY_LABELS } from './calendar.const';
import DayIndicator, { DayIndicatorProps } from './DayIndicator';

type CalendarHeaderRenderParams = {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

type CalendarProps = {
  year: number;
  month: number;
  onChangeMonth?: (year: number, month: number) => void;
  getIndicatorProps: (date: Date) => DayIndicatorProps;
  onClickDay?: (date: Date) => void;
  renderHeader?: (params: CalendarHeaderRenderParams) => ReactNode;
  showYear?: boolean;
};

function Calendar({
  year,
  month,
  onChangeMonth,
  getIndicatorProps,
  onClickDay,
  renderHeader,
  showYear = false,
}: CalendarProps) {
  const currentMonth = new Date(year, month - 1, 1);
  const titleFormat = showYear ? 'yyyy년 M월' : 'M월';
  const monthStart = startOfMonth(currentMonth);

  const days = eachDayOfInterval({
    start: monthStart,
    end: endOfMonth(currentMonth),
  });
  const leadingEmptyCount = monthStart.getDay();
  const CellElement = onClickDay ? 'button' : 'div';
  const cellClassName = `flex flex-col items-center justify-center gap-0.5 ${onClickDay ? 'cursor-pointer' : ''}`;

  const handlePrevMonth = () => {
    const prevMonth = subMonths(currentMonth, 1);
    onChangeMonth?.(prevMonth.getFullYear(), prevMonth.getMonth() + 1);
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    onChangeMonth?.(nextMonth.getFullYear(), nextMonth.getMonth() + 1);
  };

  return (
    <div className="w-full">
      {renderHeader ? (
        renderHeader({
          currentMonth,
          onPrevMonth: handlePrevMonth,
          onNextMonth: handleNextMonth,
        })
      ) : onChangeMonth ? (
        <div className="grid grid-cols-[1fr_auto_1fr] items-center px-1 py-3">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="이전 달"
            className="cursor-pointer justify-self-start"
          >
            ‹
          </button>
          <span className="text-body-05 justify-self-center">
            {format(currentMonth, titleFormat)}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="다음 달"
            className="cursor-pointer justify-self-end"
          >
            ›
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-start px-1 py-3">
          <span className="text-body-05">
            {format(currentMonth, titleFormat)}
          </span>
        </div>
      )}

      <div className="grid grid-cols-7 gap-x-[5.1%]">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-caption-06 text-grey-400 flex items-center justify-center py-2"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-x-[5.1%] gap-y-3">
        {Array.from({ length: leadingEmptyCount }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {days.map((date) => {
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          return (
            <CellElement
              key={date.toISOString()}
              type={onClickDay ? 'button' : undefined}
              onClick={onClickDay ? () => onClickDay(date) : undefined}
              className={cellClassName}
            >
              <span
                className={`text-caption-05 ${isWeekend ? 'text-red-300' : 'text-grey-400'}`}
              >
                {date.getDate()}
              </span>
              <DayIndicator {...getIndicatorProps(date)} />
            </CellElement>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
