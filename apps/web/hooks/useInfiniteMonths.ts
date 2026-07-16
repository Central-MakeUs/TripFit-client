import { useEffect, useRef, useState } from 'react';
import { addMonths } from 'date-fns';

const INITIAL_MONTH_COUNT = 3;

type UseInfiniteMonthsParams = {
  year: number;
  month: number;
};

export const useInfiniteMonths = ({ year, month }: UseInfiniteMonthsParams) => {
  const [monthCount, setMonthCount] = useState(INITIAL_MONTH_COUNT);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const baseMonth = new Date(year, month - 1, 1);
  const months = Array.from({ length: monthCount }, (_, index) => {
    const target = addMonths(baseMonth, index);
    return { year: target.getFullYear(), month: target.getMonth() + 1 };
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setMonthCount((prev) => prev + 1);
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return { months, sentinelRef };
};
