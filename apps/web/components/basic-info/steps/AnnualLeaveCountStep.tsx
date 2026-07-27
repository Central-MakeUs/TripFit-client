import AddIcon from '@/assets/icons/add.svg';
import RemoveIcon from '@/assets/icons/remove.svg';
import CtaButtonGroup from '@/components/cta-button-group';
import IconButton from '@/components/icon-button';
import Roulette from '@/components/roulette';

import { ANNUAL_LEAVE_COUNT_VALUES } from '../basicInfo.const';

type AnnualLeaveCountStepProps = {
  value: number | null;
  onChange: (value: number) => void;
  onNext: () => void;
  onSkip?: () => void;
};

function AnnualLeaveCountStep({
  value,
  onChange,
  onNext,
  onSkip,
}: AnnualLeaveCountStepProps) {
  const count = value ?? 0;
  const maxCount = ANNUAL_LEAVE_COUNT_VALUES.length - 1;

  const handleDecrement = () => onChange(Math.max(0, count - 1));
  const handleIncrement = () => onChange(Math.min(maxCount, count + 1));

  return (
    <div className="flex flex-1 flex-col">
      <h2 className="text-body-01 pt-3 pb-0.5">
        한 번에 사용 가능한 <br />
        연차 개수를 알려주세요
      </h2>
      <p className="text-caption-01 text-grey-400 pb-7.5">
        연차 개수에 맞춰 여행 가능한 날짜 폭을 넓혀드릴게요
      </p>
      <div className="flex flex-1 flex-col items-center">
        <div className="w-full" style={{ flexGrow: 93 }} />
        <div className="flex w-full items-center justify-between">
          <IconButton
            size="shadow"
            onClick={handleDecrement}
            aria-label="연차 개수 줄이기"
            icon={<RemoveIcon className="h-full w-full text-grey-500" />}
          />
          <Roulette
            value={String(count)}
            values={ANNUAL_LEAVE_COUNT_VALUES}
            onChange={(nextValue) => onChange(Number(nextValue))}
          />
          <IconButton
            size="shadow"
            onClick={handleIncrement}
            aria-label="연차 개수 늘리기"
            icon={<AddIcon className="h-full w-full text-grey-500" />}
          />
        </div>
        <span className="text-caption-01 text-grey-300 mt-2">
          없으면 0으로 입력해주세요
        </span>
        <div className="w-full" style={{ flexGrow: 226 }} />
      </div>
      <CtaButtonGroup
        primaryText="다음"
        primaryColor="secondary"
        onPrimaryClick={onNext}
        secondaryText={onSkip ? '건너뛰기' : undefined}
        secondaryVariant="text-link"
        secondaryIcon={false}
        onSecondaryClick={onSkip}
        className="px-0"
      />
    </div>
  );
}

export default AnnualLeaveCountStep;
