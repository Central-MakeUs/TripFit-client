'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Header from '@/components/header';
import ProgressBar from '@/components/progress-bar';

import {
  BASIC_INFO_PROGRESS_STEPS,
  BasicInfoScreen,
  BasicInfoValue,
  DEFAULT_BASIC_INFO_VALUE,
} from './basicInfo.const';
import HasRegularScheduleStep from './steps/HasRegularScheduleStep';

type BasicInfoProps = {
  initialValue?: BasicInfoValue;
  onComplete: (value: BasicInfoValue) => void;
  allowSkip?: boolean;
};

function BasicInfo({
  initialValue = DEFAULT_BASIC_INFO_VALUE,
  onComplete,
  allowSkip = true,
}: BasicInfoProps) {
  const router = useRouter();
  const [screenHistory, setScreenHistory] = useState<BasicInfoScreen[]>([
    'hasRegularSchedule',
  ]);
  const [value, setValue] = useState<BasicInfoValue>(initialValue);

  const screen =
    screenHistory[screenHistory.length - 1] ?? 'hasRegularSchedule';

  const currentStepIndex = BASIC_INFO_PROGRESS_STEPS.findIndex((group) =>
    group.includes(screen),
  );
  const progress =
    ((currentStepIndex + 1) / BASIC_INFO_PROGRESS_STEPS.length) * 100;

  const navigateTo = (nextScreen: BasicInfoScreen) => {
    setScreenHistory((prev) => [...prev, nextScreen]);
  };

  const handleBack = () => {
    if (screenHistory.length === 1) {
      router.back();
      return;
    }
    setScreenHistory((prev) => prev.slice(0, -1));
  };

  const handleHasRegularScheduleNext = (hasRegularSchedule: boolean) => {
    setValue((prev) => ({ ...prev, hasRegularSchedule }));
    navigateTo(
      hasRegularSchedule ? 'regularScheduleDetail' : 'annualLeaveCount',
    );
  };

  const handleHasRegularScheduleSkip = () => {
    setValue((prev) => ({ ...prev, hasRegularSchedule: null }));
    navigateTo('annualLeaveCount');
  };

  return (
    <div className="flex w-full flex-1 flex-col">
      <Header variant="page" title="일정 입력하기" onBack={handleBack} />
      <div className="px-5 py-1">
        <ProgressBar size="sm" value={progress} />
      </div>
      <div className="flex w-full flex-1 flex-col px-5">
        {screen === 'hasRegularSchedule' && (
          <HasRegularScheduleStep
            value={value.hasRegularSchedule}
            onNext={handleHasRegularScheduleNext}
            onSkip={allowSkip ? handleHasRegularScheduleSkip : undefined}
          />
        )}
        {/* TODO: 나머지 스텝 구현 예정 */}
        {screen === 'complete' && (
          <button type="button" onClick={() => onComplete(value)}>
            임시: 완료
          </button>
        )}
      </div>
    </div>
  );
}

export default BasicInfo;
