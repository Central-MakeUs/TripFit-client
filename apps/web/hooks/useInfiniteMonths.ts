import { useEffect, useRef, useState } from 'react';
import { addMonths } from 'date-fns';

const INITIAL_MONTH_COUNT = 3;

type UseInfiniteMonthsParams = {
  year: number;
  month: number;
  /** 지정하면 이 개수를 넘어서는 스크롤을 막는다 — 미지정 시 기존처럼 무제한 */
  maxMonthCount?: number;
};

export const useInfiniteMonths = ({
  year,
  month,
  maxMonthCount,
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
