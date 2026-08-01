import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  startOfMonth,
  subMonths,
} from 'date-fns';

type UseMonthGridParams = {
  year: number;
  month: number;
  onChangeMonth?: (year: number, month: number) => void;
};

export const useMonthGrid = ({
  year,
  month,
  onChangeMonth,
}: UseMonthGridParams) => {
  const currentMonth = new Date(year, month - 1, 1);
  const monthStart = startOfMonth(currentMonth);
  const days = eachDayOfInterval({
    start: monthStart,
    end: endOfMonth(currentMonth),
  });
  const leadingEmptyCount = monthStart.getDay();

  const handlePrevMonth = () => {
    const prevMonth = subMonths(currentMonth, 1);
    onChangeMonth?.(prevMonth.getFullYear(), prevMonth.getMonth() + 1);
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    onChangeMonth?.(nextMonth.getFullYear(), nextMonth.getMonth() + 1);
  };

  return {
    currentMonth,
    days,
    leadingEmptyCount,
    handlePrevMonth,
    handleNextMonth,
  };
};
