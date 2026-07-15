import { cn } from '@/utils/cn';

type RecommendationStatBoxProps = {
  uncertainCount: number;
  partialCount: number;
  leaveCount: number;
  theme?: 'blue' | 'grey';
  className?: string;
};

const STAT_BOX_THEME = {
  blue: {
    boxBg: 'bg-blue-50/60',
    valueColor: 'text-blue-600',
    borderColor: 'border-blue-100',
  },
  grey: {
    boxBg: 'bg-grey-100/40',
    valueColor: 'text-grey-600',
    borderColor: 'border-grey-100',
  },
};

function RecommendationStatBox({
  uncertainCount,
  partialCount,
  leaveCount,
  theme = 'grey',
  className,
}: RecommendationStatBoxProps) {
  const { boxBg, valueColor, borderColor } = STAT_BOX_THEME[theme];

  const statLabelClassName = 'text-caption-03 text-grey-400 whitespace-nowrap';
  const statValueClassName = cn('text-body-01', valueColor);
  const statBorderClassName = cn('border-r', borderColor);

  const stats = [
    { label: '불확실 일정', value: uncertainCount },
    { label: '부분 참여', value: partialCount },
    { label: '연차 일수', value: leaveCount },
  ];

  return (
    <div
      className={cn(
        'grid grid-cols-3 pt-4 pb-3 rounded-[20px] text-center',
        boxBg,
        className,
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
  );
}

export default RecommendationStatBox;
