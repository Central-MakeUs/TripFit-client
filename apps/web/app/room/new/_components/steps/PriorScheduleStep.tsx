'use client';

import { useState } from 'react';

import ScheduleEditor from '@/components/schedule-editor';
import { ScheduleDateStatus } from '@/components/schedule-editor/scheduleEditor.const';

export type PriorScheduleValue = Record<string, ScheduleDateStatus>;

type PriorScheduleStepProps = {
  value: PriorScheduleValue;
  onChange: (value: PriorScheduleValue) => void;
};

function PriorScheduleStep({ value, onChange }: PriorScheduleStepProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  return (
    <div className="flex flex-col">
      <h2 className="text-body-01 pt-3 pb-0.5">
        선약이 있는 날짜를 알려주세요
      </h2>
      <p className="text-caption-01 text-grey-500 pb-7.5">
        항목을 선택하고 날짜를 칠해주세요
      </p>
      <ScheduleEditor
        year={year}
        month={month}
        onChangeMonth={(nextYear, nextMonth) => {
          setYear(nextYear);
          setMonth(nextMonth);
        }}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default PriorScheduleStep;
