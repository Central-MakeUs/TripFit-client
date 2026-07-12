import { cn } from '@/utils/cn';

type BadgeProps = {
  className?: string;
  count: number;
};

const MAX_COUNT = 99;

function Badge({ className, count }: BadgeProps) {
  return (
    <div
      className={cn(
        'flex h-4 min-w-4 items-center justify-center rounded-full border-[1.5px] border-white bg-blue-500 px-0.5 pt-px',
        className,
      )}
    >
      <span className="text-caption-06 text-white">
        +{Math.min(count, MAX_COUNT)}
      </span>
    </div>
  );
}

export default Badge;
