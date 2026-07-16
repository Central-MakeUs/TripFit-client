'use client';

import ScheduleCalendar from '@/components/schedule-calendar';
import { DayScheduleValueT } from '@/types/schedule';

export type PriorScheduleValue = Record<string, DayScheduleValueT>;

type PriorScheduleStepProps = {
  value: PriorScheduleValue;
  onChange: (value: PriorScheduleValue) => void;
};

function PriorScheduleStep({ value, onChange }: PriorScheduleStepProps) {
  const today = new Date();

  return (
    <div className="flex flex-col">
      <h2 className="text-body-01 pt-3 pb-0.5">
        선약이 있는 날짜를 알려주세요
      </h2>
      <p className="text-caption-01 text-grey-500 pb-7.5">
        항목을 선택하고 날짜를 칠해주세요
      </p>
      <ScheduleCalendar
        year={today.getFullYear()}
        month={today.getMonth() + 1}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default PriorScheduleStep;
