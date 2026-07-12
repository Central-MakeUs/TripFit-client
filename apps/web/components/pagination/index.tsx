import { cn } from '@/utils/cn';

import { paginationDotStyle } from './pagination.style';

type PaginationProps = {
  className?: string;
  current: number;
  onDotClick?: (index: number) => void;
  total: number;
};

function Pagination({
  className,
  current,
  onDotClick,
  total,
}: PaginationProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: total }).map((_, index) =>
        onDotClick ? (
          <button
            key={index}
            type="button"
            aria-label={`${index + 1}번째로 이동`}
            aria-current={index === current}
            onClick={() => onDotClick(index)}
            className={cn(
              paginationDotStyle({ active: index === current }),
              'cursor-pointer',
            )}
          />
        ) : (
          <span
            key={index}
            className={paginationDotStyle({ active: index === current })}
          />
        ),
      )}
    </div>
  );
}

export default Pagination;
