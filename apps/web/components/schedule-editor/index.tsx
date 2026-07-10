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
    const current = value[key];

    if (selectedTool === 'unavailable') {
      const isFullyUnavailable =
        current?.status === 'responded' &&
        current.morning === 'unavailable' &&
        current.afternoon === 'unavailable' &&
        current.evening === 'unavailable';

      if (isFullyUnavailable) {
        const next = { ...value };
        delete next[key];
        onChange(next);
        return;
      }

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
      if (current?.status === 'uncertain') {
        const next = { ...value };
        delete next[key];
        onChange(next);
        return;
      }

      onChange({ ...value, [key]: { status: 'uncertain' } });
      return;
    }

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
    <div className="flex w-full flex-col gap-10">
      <ScheduleStatusSelector value={selectedTool} onChange={setSelectedTool} />
      <Calendar
        year={year}
        month={month}
        onChangeMonth={onChangeMonth}
        onClickDay={handleClickDay}
        getIndicatorProps={getIndicatorProps}
        showYear
      />
    </div>
  );
}

export default ScheduleEditor;
