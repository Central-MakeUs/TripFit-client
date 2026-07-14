import { cn } from '@/utils/cn';

type BadgeProps = {
  className?: string;
  count: number;
};

const MAX_COUNT = 99;

function Badge({ className, count }: BadgeProps) {
  if (count <= 0) return null;

  return (
    <div
      className={cn(
        'flex h-4 min-w-4 items-center justify-center rounded-full border-[1.5px] border-white bg-blue-500 px-0.5 pt-px',
        className,
      )}
    >
      <span className="text-caption-06 text-white">
        {count > MAX_COUNT ? `+${MAX_COUNT}` : count}
      </span>
    </div>
  );
}

export default Badge;
