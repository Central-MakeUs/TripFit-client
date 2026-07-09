'use client';

import { useState } from 'react';

import ScheduleEditor from '@/components/schedule-editor';
import { ScheduleDateStatus } from '@/components/schedule-editor/scheduleEditor.const';

const today = new Date();

function ScheduleEditorPreview() {
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [dateStatuses, setDateStatuses] = useState<
    Record<string, ScheduleDateStatus>
  >({});

  const handleChangeMonth = (nextYear: number, nextMonth: number) => {
    setYear(nextYear);
    setMonth(nextMonth);
  };

  return (
    <ScheduleEditor
      year={year}
      month={month}
      onChangeMonth={handleChangeMonth}
      value={dateStatuses}
      onChange={setDateStatuses}
    />
  );
}

export default ScheduleEditorPreview;
