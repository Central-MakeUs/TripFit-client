'use client';

import { useState } from 'react';

import Calendar from '@/components/calendar';
import { DayIndicatorProps } from '@/components/calendar/DayIndicator';

import {
  DaySegmentStatus,
  ScheduleDateStatus,
  SEGMENT_FIELD_BY_TOOL,
} from './scheduleEditor.const';
import ScheduleStatusSelector from './ScheduleStatusSelector';
import { ScheduleStatusOption } from './scheduleStatusSelector.const';

type ScheduleEditorProps = {
  year: number;
  month: number;
  onChangeMonth: (year: number, month: number) => void;
  value: Record<string, ScheduleDateStatus>;
  onChange: (value: Record<string, ScheduleDateStatus>) => void;
};

function ScheduleEditor({
  year,
  month,
  onChangeMonth,
  value,
  onChange,
}: ScheduleEditorProps) {
  const [selectedTool, setSelectedTool] =
    useState<ScheduleStatusOption>('unavailable');

  const handleClickDay = (date: Date) => {
    const key = date.toDateString();

    if (selectedTool === 'unavailable') {
      onChange({
        ...value,
        [key]: {
          status: 'responded',
          morning: 'unavailable',
          afternoon: 'unavailable',
          evening: 'unavailable',
        },
      });
      return;
    }

    if (selectedTool === 'uncertain') {
      onChange({ ...value, [key]: { status: 'uncertain' } });
      return;
    }

    const current = value[key];
    const base =
      current?.status === 'responded'
        ? current
        : ({
            status: 'responded',
            morning: 'available',
            afternoon: 'available',
            evening: 'available',
          } as const);

    const segmentField = SEGMENT_FIELD_BY_TOOL[selectedTool];
    const nextSegmentValue: DaySegmentStatus =
      base[segmentField] === 'unavailable' ? 'available' : 'unavailable';

    onChange({
      ...value,
      [key]: { ...base, [segmentField]: nextSegmentValue },
    });
  };

  const getIndicatorProps = (date: Date): DayIndicatorProps => {
    const dateStatus = value[date.toDateString()];

    if (!dateStatus) {
      return {
        variant: 'segmented',
        status: 'responded',
        morning: 'available',
        afternoon: 'available',
        evening: 'available',
      };
    }

    if (dateStatus.status === 'uncertain') {
      return { variant: 'segmented', status: 'uncertain' };
    }

    return {
      variant: 'segmented',
      status: 'responded',
      morning: dateStatus.morning,
      afternoon: dateStatus.afternoon,
      evening: dateStatus.evening,
    };
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <ScheduleStatusSelector value={selectedTool} onChange={setSelectedTool} />
      <Calendar
        year={year}
        month={month}
        onChangeMonth={onChangeMonth}
        onClickDay={handleClickDay}
        getIndicatorProps={getIndicatorProps}
      />
    </div>
  );
}

export default ScheduleEditor;
