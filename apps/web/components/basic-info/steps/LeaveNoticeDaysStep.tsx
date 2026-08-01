import CheckIcon from '@/assets/icons/check.svg';
import CtaButtonGroup from '@/components/cta-button-group';
import { cn } from '@/utils/cn';

import { LEAVE_NOTICE_DAYS_OPTIONS } from '../basicInfo.const';

type LeaveNoticeDaysStepProps = {
  value: number | null;
  onChange: (value: number) => void;
  onNext: () => void;
  onSkip?: () => void;
};

function LeaveNoticeDaysStep({
  value,
  onChange,
  onNext,
  onSkip,
}: LeaveNoticeDaysStepProps) {
  return (
    <div className="flex flex-1 flex-col">
      <h2 className="text-body-01 pt-3 pb-0.5">
        연차는 최소 며칠 전에 <br />
        신청해야 하나요?
      </h2>
      <p className="text-caption-01 text-grey-400 pb-7.5">
        신청 기한을 넘기는 날짜는 후보에서 제외할게요
      </p>
      <div role="radiogroup" className="flex flex-col gap-2">
        {LEAVE_NOTICE_DAYS_OPTIONS.map((option) => {
          const checked = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onChange(option.value)}
              className={cn(
                'flex cursor-pointer items-center justify-between rounded-xl border-[1.2px] border-transparent bg-grey-50 p-4',
                checked && 'border-blue-200 bg-blue-20',
              )}
            >
              <span className="text-body-05 text-grey-800">{option.label}</span>
              {checked && (
                <span className="flex size-6 items-center justify-center rounded-full bg-blue-500">
                  <CheckIcon className="size-4 text-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <CtaButtonGroup
        primaryText="다음"
        primaryColor="secondary"
        primaryDisabled={value === null}
        onPrimaryClick={onNext}
        secondaryText={onSkip ? '건너뛰기' : undefined}
        secondaryVariant="text-link"
        secondaryIcon={false}
        onSecondaryClick={onSkip}
        className="mt-auto px-0"
      />
    </div>
  );
}

export default LeaveNoticeDaysStep;
