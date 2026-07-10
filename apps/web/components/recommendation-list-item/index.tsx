import Image from 'next/image';

import { cn } from '@/utils/cn';

type RankIconProps = {
  rank: number;
};

function RankIcon({ rank }: RankIconProps) {
  return (
    <div className="flex size-6 shrink-0 flex-col items-center justify-end">
      <Image
        src="/icons/rank-crown.svg"
        alt=""
        width={20}
        height={20}
        className="-mb-2"
      />
      <div className="flex size-6 items-center justify-center rounded-[10px] border-[1.5px] border-grey-50 bg-blue-500">
        <span className="text-caption-01 text-white">{rank}</span>
      </div>
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

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={cn(
        'flex w-full cursor-pointer items-center rounded-2xl',
        hasRank ? 'h-20 gap-0.5 py-5 pr-2 pl-4' : cn('p-4', active && 'gap-1'),
        active
          ? 'border border-blue-200 bg-blue-20'
          : 'bg-grey-20 active:bg-grey-50',
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
            <Image
              src="/icons/chevron-right.svg"
              alt=""
              width={16}
              height={16}
            />
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
          {active && (
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-500">
              <Image src="/icons/check.svg" alt="" width={24} height={24} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RecommendationListItem;
