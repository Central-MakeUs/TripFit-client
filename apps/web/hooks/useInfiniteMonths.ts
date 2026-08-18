import { useEffect, useRef, useState } from 'react';
import { addMonths, differenceInCalendarMonths } from 'date-fns';

const INITIAL_MONTH_COUNT = 3;

type UseInfiniteMonthsParams = {
  year: number;
  month: number;
  /** 지정하면 이 개수를 넘어서는 스크롤을 막는다 — 미지정 시 기존처럼 무제한 */
  maxMonthCount?: number;
  /** 지정하면 year/month(달력 시작 기준)는 그대로 두고, 이 연/월까지 목록을
   * 미리 확장해 렌더링한다 — year/month 자체를 이 값으로 옮기면 그 이전
   * 달(오늘이 속한 달 포함)을 스크롤로 다시 볼 수 없게 되므로, 시작 기준은
   * 건드리지 않고 필요한 만큼만 앞당겨 그려서 스크롤 대상으로 삼는다 */
  focusYear?: number;
  focusMonth?: number;
};

export const useInfiniteMonths = ({
  year,
  month,
  maxMonthCount,
  focusYear,
  focusMonth,
}: UseInfiniteMonthsParams) => {
  const initialCount =
    maxMonthCount !== undefined
      ? Math.min(INITIAL_MONTH_COUNT, maxMonthCount)
      : INITIAL_MONTH_COUNT;
  const [monthCount, setMonthCount] = useState(initialCount);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMonthCount(initialCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, maxMonthCount]);

  useEffect(() => {
    if (focusYear === undefined || focusMonth === undefined) return;
    const targetIndex = differenceInCalendarMonths(
      new Date(focusYear, focusMonth - 1, 1),
      new Date(year, month - 1, 1),
    );
    if (targetIndex < 0) return;
    const needed = targetIndex + 1;
    setMonthCount((prev) => {
      const next =
        maxMonthCount !== undefined ? Math.min(needed, maxMonthCount) : needed;
      return Math.max(prev, next);
    });
  }, [focusYear, focusMonth, maxMonthCount, year, month]);

  const baseMonth = new Date(year, month - 1, 1);
  const months = Array.from({ length: monthCount }, (_, index) => {
    const target = addMonths(baseMonth, index);
    return { year: target.getFullYear(), month: target.getMonth() + 1 };
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    if (maxMonthCount !== undefined && monthCount >= maxMonthCount) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setMonthCount((prev) =>
            maxMonthCount !== undefined
              ? Math.min(prev + 1, maxMonthCount)
              : prev + 1,
          );
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [monthCount, maxMonthCount]);

  return { months, sentinelRef };
};
