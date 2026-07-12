import ArrowRightIcon from '@/assets/icons/arrow-right-300.svg';
import CheckCircleIcon from '@/assets/icons/check-circle.svg';
import RankBadgeIcon from '@/assets/icons/rank-badge.svg';
import { cn } from '@/utils/cn';

type RankIconProps = {
  rank: number;
};

function RankIcon({ rank }: RankIconProps) {
  if (rank === 1) {
    return (
      <div className="relative flex h-[33px] w-6 shrink-0 items-end justify-center">
        <RankBadgeIcon className="absolute inset-0 size-full text-blue-500" />
        <span className="relative text-caption-01 text-white">{rank}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-[10px]',
        rank === 2 ? 'bg-blue-200' : 'bg-blue-100',
      )}
    >
      <span
        className={cn(
          'text-caption-01',
          rank === 2 ? 'text-blue-500' : 'text-blue-400',
        )}
      >
        {rank}
      </span>
    </div>
  );
}

type RecommendationListItemProps = {
  active?: boolean;
  className?: string;
  description: string;
  onClick?: () => void;
  rank?: number;
  title: string;
};

function RecommendationListItem({
  active = false,
  className,
  description,
  onClick,
  rank,
  title,
}: RecommendationListItemProps) {
  const hasRank = rank !== undefined;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex w-full cursor-pointer items-center rounded-2xl',
        hasRank ? 'h-20 gap-0.5 py-5 pr-2 pl-4' : cn('p-4', active && 'gap-1'),
        active
          ? 'border border-blue-200 bg-blue-20'
          : 'bg-grey-20 active:bg-grey-50',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700',
        className,
      )}
    >
      {hasRank ? (
        <>
          <div className="flex flex-1 items-center gap-4">
            <RankIcon rank={rank} />
            <div className="flex flex-1 flex-col items-start gap-1">
              <p className="w-full text-body-05 text-grey-800">{title}</p>
              <p className="w-full text-caption-03 text-grey-400">
                {description}
              </p>
            </div>
          </div>
          <div className="flex size-8 shrink-0 items-center justify-center">
            <ArrowRightIcon className="size-4 text-grey-500" />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-1 flex-col items-start gap-1">
            <p className="w-full text-body-05 text-grey-800">{title}</p>
            <p className="w-full text-caption-04 text-grey-400">
              {description}
            </p>
          </div>
          {active && <CheckCircleIcon className="size-6 shrink-0" />}
        </>
      )}
    </div>
  );
}

export default RecommendationListItem;
