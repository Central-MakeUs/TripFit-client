import ArrowOutwardIcon from '@/assets/icons/arrow-outward.svg';
import RankBadgeIcon from '@/assets/icons/rank-badge.svg';
import { RecommendationCandidateT } from '@/types/recommendation';
import { cn } from '@/utils/cn';

import { formatDateLabel } from '../../_utils/formatDateLabel';
import RecommendationStatBox from './RecommendationStatBox';

type RecommendationCandidateCardProps = {
  candidate: RecommendationCandidateT;
  active: boolean;
  onClick: () => void;
  className?: string;
};

const GRADIENT_OVERLAY_CLASS_NAME =
  'bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_100%)]';

const CARD_THEME = {
  active: {
    cardBg: 'bg-blue-20',
    buttonBg: 'bg-blue-50',
    iconColor: 'text-blue-200',
    badgeIconColor: 'text-blue-500',
    plainBadgeBg: 'bg-blue-200',
    plainBadgeText: 'text-blue-500',
    statBoxTheme: 'blue' as const,
  },
  inactive: {
    cardBg: 'bg-grey-20',
    buttonBg: 'bg-grey-100/40',
    iconColor: 'text-grey-300',
    badgeIconColor: 'text-grey-300',
    plainBadgeBg: 'bg-grey-300',
    plainBadgeText: 'text-white',
    statBoxTheme: 'grey' as const,
  },
};

function RecommendationCandidateCard({
  candidate,
  active,
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
  const theme = active ? CARD_THEME.active : CARD_THEME.inactive;

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
      <div
        className={cn('flex', isTopRank ? '-mt-2 items-end' : 'items-center')}
      >
        {isTopRank ? (
          <div className="relative flex h-11 w-8 items-end justify-center">
            <RankBadgeIcon
              className={cn('absolute inset-0 size-full', theme.badgeIconColor)}
            />
            <span className="relative mb-0.5 text-body-03 text-white">
              {rank}
            </span>
          </div>
        ) : (
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-[13.333px]',
              theme.plainBadgeBg,
            )}
          >
            <span className={cn('text-body-03', theme.plainBadgeText)}>
              {rank}
            </span>
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
        <RecommendationStatBox
          uncertainCount={uncertainCount}
          partialCount={partialCount}
          leaveCount={leaveCount}
          theme={theme.statBoxTheme}
          className="mt-4"
        />
      </div>
    </div>
  );
}

export default RecommendationCandidateCard;
