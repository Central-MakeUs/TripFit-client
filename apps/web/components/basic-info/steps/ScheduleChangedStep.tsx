'use client';

import { useState } from 'react';

import BusinessCenterIcon from '@/assets/icons/business-center.svg';
import EditCalendarIcon from '@/assets/icons/edit-calendar.svg';
import { cn } from '@/utils/cn';

type ScheduleChangedStepProps = {
  onNext: () => void;
};

// HasRegularScheduleStep과 달리 답변이 실제 플로우를 가르지 않는다 — 갱신 입력
// 사용자에게 "처음부터 다시 입력하는 게 아니라 기존 정보를 확인·수정하는
// 과정"임을 안내하기 위한 화면일 뿐, 두 선택지 모두 정기 일정 수정 화면으로
// 똑같이 이어진다.
function ScheduleChangedStep({ onNext }: ScheduleChangedStepProps) {
  const [selected, setSelected] = useState<boolean | null>(null);

  const handleSelect = (value: boolean) => {
    setSelected(value);
    onNext();
  };

  return (
    <section
      aria-labelledby="schedule-changed-heading"
      className="flex flex-1 flex-col"
    >
      <h2 id="schedule-changed-heading" className="text-body-01 pt-3 pb-0.5">
        일정 변경이 있나요?
      </h2>
      <p className="text-caption-01 text-grey-400 pb-13">
        기존에 입력한 일정을 확인하고 필요한 부분만 수정해주세요
      </p>
      <div role="radiogroup" className="flex flex-col gap-2 py-8">
        <button
          type="button"
          role="radio"
          aria-checked={selected === true}
          onClick={() => handleSelect(true)}
          className={cn(
            'flex items-center cursor-pointer rounded-2xl border-[1.2px] border-transparent bg-grey-50 px-3 py-4 gap-3 transition-colors active:border-blue-200 active:bg-blue-20',
            selected === true ? 'border border-blue-200 bg-blue-20' : '',
          )}
        >
          <EditCalendarIcon className="size-9 text-blue-500" />
          <div className="flex flex-col text-left">
            <span className="text-body-03">있어요</span>
            <span className="text-caption-03 text-grey-500">
              변경된 부분을 수정할게요
            </span>
          </div>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={selected === false}
          onClick={() => handleSelect(false)}
          className={cn(
            'flex items-center cursor-pointer rounded-2xl border-[1.2px] border-transparent bg-grey-50 px-3 py-4 gap-3 transition-colors active:border-blue-200 active:bg-blue-20',
            selected === false ? 'border border-blue-200 bg-blue-20' : '',
          )}
        >
          <BusinessCenterIcon className="size-9 text-blue-500" />
          <div className="flex flex-col text-left">
            <span className="text-body-03">없어요</span>
            <span className="text-caption-03 text-grey-500">
              입력해둔 내용 그대로 확인할게요
            </span>
          </div>
        </button>
      </div>
    </section>
  );
}

export default ScheduleChangedStep;
