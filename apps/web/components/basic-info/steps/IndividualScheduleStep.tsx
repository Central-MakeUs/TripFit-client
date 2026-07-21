'use client';

import { useEffect, useState } from 'react';

import ScheduleCalendar from '@/components/schedule-calendar';
import { IndividualScheduleValueT } from '@/types/schedule';

type IndividualScheduleStepProps = {
  value: IndividualScheduleValueT;
  onChange: (value: IndividualScheduleValueT) => void;
};

function IndividualScheduleStep({
  value,
  onChange,
}: IndividualScheduleStepProps) {
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setToday(new Date());
  }, []);

  return (
    <div className="flex flex-col">
      <h2 className="text-body-01 mt-3 mb-13">
        날짜를 클릭해 스케줄을 입력해주세요
      </h2>
      {today && (
        <ScheduleCalendar
          year={today.getFullYear()}
          month={today.getMonth() + 1}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
}

export default IndividualScheduleStep;
