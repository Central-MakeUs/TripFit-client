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
      <h2 className="text-body-01 mt-3 mb-13">
        날짜를 클릭해 스케줄을 입력해주세요
      </h2>
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
