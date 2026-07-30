import { cn } from '@/utils/cn';

type SpinnerProps = {
  className?: string;
};

function Spinner({ className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="로딩 중"
      className={cn(
        'size-6 animate-spin rounded-full border-2 border-grey-100 border-t-blue-500',
        className,
      )}
    />
  );
}

export default Spinner;
