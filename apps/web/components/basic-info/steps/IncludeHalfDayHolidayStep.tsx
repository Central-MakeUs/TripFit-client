import CtaButtonGroup from '@/components/cta-button-group';
import Toggle from '@/components/toggle';

import { IncludeHalfDayHolidayValueT } from '../basicInfo.const';

type IncludeHalfDayHolidayStepProps = {
  value: IncludeHalfDayHolidayValueT;
  onChange: (value: IncludeHalfDayHolidayValueT) => void;
  onNext: () => void;
  onSkip?: () => void;
  primaryText?: string;
};

function IncludeHalfDayHolidayStep({
  value,
  onChange,
  onNext,
  onSkip,
  primaryText = '다음',
}: IncludeHalfDayHolidayStepProps) {
  return (
    <div className="flex flex-1 flex-col">
      <h2 className="text-body-01 pt-3 pb-0.5">
        반차나 공휴일도 <br />
        후보에 포함할까요?
      </h2>
      <p className="text-caption-01 text-grey-400 pb-7.5">
        선택하신 옵션에 맞춰 후보 날짜를 더 넓혀볼게요
      </p>
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-5 rounded-xl bg-grey-20 p-4">
          <div className="flex flex-1 flex-col gap-2">
            <span className="text-body-05 text-grey-800">
              반차 사용도 가능해요
            </span>
            <span className="text-caption-02 text-grey-500">
              오전/오후 반차 옵션을 고려해서 더 넓은 후보를 생성해요
            </span>
          </div>
          <Toggle
            aria-label="반차 사용 포함"
            checked={value.halfDay}
            onCheckedChange={(halfDay) => onChange({ ...value, halfDay })}
          />
        </div>
        <div className="flex items-start gap-5 rounded-xl bg-grey-20 p-4">
          <div className="flex flex-1 flex-col gap-2">
            <span className="text-body-05 text-grey-800">
              공휴일에도 여행갈 수 있어요
            </span>
            <span className="text-caption-02 text-grey-500">
              법정 공휴일도 여행 가능한 날짜로 포함할게요
            </span>
          </div>
          <Toggle
            aria-label="공휴일 포함"
            checked={value.holiday}
            onCheckedChange={(holiday) => onChange({ ...value, holiday })}
          />
        </div>
      </div>
      <CtaButtonGroup
        primaryText={primaryText}
        primaryColor="secondary"
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

export default IncludeHalfDayHolidayStep;
