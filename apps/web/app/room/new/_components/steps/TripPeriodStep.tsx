'use client';

import { useState } from 'react';
import { format, isSameDay } from 'date-fns';

import CalendarMonthIcon from '@/assets/icons/calendar-month.svg';
import BottomSheet from '@/components/bottom-sheet';
import Button from '@/components/button';
import Input from '@/components/input';

import DatePicker from './_components/DatePicker';
import DatePickerTitle from './_components/DatePickerTitle';

export type TripPeriodValue = {
  startDate: Date | null;
  endDate: Date | null;
};

type TripPeriodStepProps = {
  value: TripPeriodValue;
  onChange: (value: TripPeriodValue) => void;
};

const formatDate = (date: Date | null) =>
  date ? format(date, 'yy.MM.dd') : '';

function TripPeriodStep({ value, onChange }: TripPeriodStepProps) {
  const [open, setOpen] = useState(false);
  const today = new Date();

  const handleSelectDate = (date: Date) => {
    const { startDate, endDate } = value;

    if (startDate && !endDate && isSameDay(date, startDate)) {
      onChange({ startDate: null, endDate: null });
      return;
    }

    if (!startDate || (startDate && endDate)) {
      onChange({ startDate: date, endDate: null });
      return;
    }

    if (date < startDate) {
      onChange({ startDate: date, endDate: startDate });
      return;
    }

    onChange({ startDate, endDate: date });
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-body-01 pt-3 pb-0.5">언제쯤 여행 갈 예정인가요?</h2>
      <p className="text-caption-01 text-grey-500 pb-7.5">
        대략적으로 알려주시면 그 안에서 날짜를 찾을게요
      </p>
      <span className="text-body-05 mb-2 block">여행 시기</span>
      <div className="flex items-center gap-1">
        <div className="min-w-0 flex-1">
          <Input
            placeholder="YY.MM.DD"
            readOnly
            value={formatDate(value.startDate)}
            prefixSlot={<CalendarMonthIcon className="h-4 w-4 text-grey-500" />}
            onClick={() => setOpen(true)}
          />
        </div>
        <div className="h-[1.5px] w-1.5 shrink-0 bg-grey-200" />
        <div className="min-w-0 flex-1">
          <Input
            placeholder="YY.MM.DD"
            readOnly
            value={formatDate(value.endDate)}
            prefixSlot={<CalendarMonthIcon className="h-4 w-4 text-grey-500" />}
            onClick={() => setOpen(true)}
          />
        </div>
      </div>
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title={
          <DatePickerTitle
            startDate={value.startDate}
            endDate={value.endDate}
          />
        }
        variant="non-modal"
      >
        <div className="px-4 pb-20">
          <DatePicker
            year={today.getFullYear()}
            month={today.getMonth() + 1}
            startDate={value.startDate}
            endDate={value.endDate}
            onSelectDate={handleSelectDate}
          />
        </div>
        <div className="fixed inset-x-0 bottom-0 z-10 pt-2 pb-0.5 px-5">
          <Button
            text="입력하기"
            type="secondary"
            disabled={!value.startDate || !value.endDate}
            onClick={() => setOpen(false)}
            className="w-full"
          />
        </div>
      </BottomSheet>
    </div>
  );
}

export default TripPeriodStep;
