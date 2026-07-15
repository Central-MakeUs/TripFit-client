import ArrowOutwardIcon from '@/assets/icons/arrow-outward.svg';
import RankBadgeIcon from '@/assets/icons/rank-badge.svg';
import { RecommendationCandidateT } from '@/types/recommendation';
import { cn } from '@/utils/cn';

import { formatDateLabel } from './_utils/formatDateLabel';

type RecommendationCandidateCardProps = {
  candidate: RecommendationCandidateT;
  onClick: () => void;
  className?: string;
};

const GRADIENT_OVERLAY_CLASS_NAME =
  'bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_100%)]';

const CARD_THEME = {
  top: {
    cardBg: 'bg-blue-20',
    rankRow: '-mt-2 items-end',
    buttonBg: 'bg-blue-50',
    iconColor: 'text-blue-200',
    boxBg: 'bg-blue-50/60',
    valueColor: 'text-blue-600',
    borderColor: 'border-blue-100',
  },
  rest: {
    cardBg: 'bg-grey-20',
    rankRow: 'items-center',
    buttonBg: 'bg-grey-100/40',
    iconColor: 'text-grey-300',
    boxBg: 'bg-grey-100/40',
    valueColor: 'text-grey-600',
    borderColor: 'border-grey-100',
  },
};

function RecommendationCandidateCard({
  candidate,
  onClick,
  className,
}: RecommendationCandidateCardProps) {
  const {
    rank,
    startDate,
    endDate,
    attendanceRate,
    uncertainCount,
    partialCount,
    leaveCount,
  } = candidate;
  const isTopRank = rank === 1;
  const theme = isTopRank ? CARD_THEME.top : CARD_THEME.rest;

  const statLabelClassName = 'text-caption-03 text-grey-400 whitespace-nowrap';
  const statValueClassName = cn('text-body-01', theme.valueColor);
  const statBorderClassName = cn('border-r', theme.borderColor);

  const stats = [
    { label: '불확실 일정', value: uncertainCount },
    { label: '부분 참여', value: partialCount },
    { label: '연차 일수', value: leaveCount },
  ];

  return (
    <div
      className={cn(
        'h-90 w-73 shrink-0 rounded-2xl p-4',
        theme.cardBg,
        GRADIENT_OVERLAY_CLASS_NAME,
        'flex flex-col',
        className,
      )}
    >
      <div className={cn('flex', theme.rankRow)}>
        {isTopRank ? (
          <div className="relative flex h-11 w-8 items-end justify-center">
            <RankBadgeIcon className="absolute inset-0 size-full text-blue-500" />
            <span className="relative mb-0.5 text-body-03 text-white">
              {rank}
            </span>
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-[13.333px] bg-grey-300">
            <span className="text-body-03 text-white">{rank}</span>
          </div>
        )}
        <button
          type="button"
          onClick={onClick}
          aria-label="추천 일정 상세보기"
          className={cn(
            'ml-auto flex size-9 cursor-pointer items-center justify-center rounded-full',
            theme.buttonBg,
          )}
        >
          <ArrowOutwardIcon className={cn('size-6', theme.iconColor)} />
        </button>
      </div>
      <div className="mt-auto flex flex-col gap-1">
        <p className="text-headline-03 text-grey-800">
          {formatDateLabel(startDate)}
          <span className="text-grey-400"> - </span>
          {formatDateLabel(endDate)}
        </p>
        <p className="flex gap-1 text-body-03 text-grey-600">
          <span>참석률</span>
          <span>{attendanceRate}%</span>
        </p>
        <div
          className={cn(
            'mt-4 grid grid-cols-3 pt-4 pb-3 rounded-[20px] text-center',
            theme.boxBg,
          )}
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                'flex flex-col items-start gap-1.75 px-4',
                index < stats.length - 1 && statBorderClassName,
              )}
            >
              <span className={statLabelClassName}>{stat.label}</span>
              <span className={statValueClassName}>{stat.value}명</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecommendationCandidateCard;
