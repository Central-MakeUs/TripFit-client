'use client';

import { useState } from 'react';
import { format } from 'date-fns';

import CalendarMonthIcon from '@/assets/icons/calendar-month.svg';
import BottomSheet from '@/components/bottom-sheet';
import Button from '@/components/button';
import DatePicker from '@/components/date-picker';
import DatePickerTitle from '@/components/date-picker/DatePickerTitle';
import Input from '@/components/input';

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
  const [draftValue, setDraftValue] = useState<TripPeriodValue>(value);
  const [activeField, setActiveField] = useState<'start' | 'end'>('start');
  const today = new Date();

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraftValue(value);
    }
    setOpen(nextOpen);
  };

  const handleOpenStartPicker = () => {
    setActiveField('start');
    handleOpenChange(true);
  };

  const handleOpenEndPicker = () => {
    setActiveField('end');
    handleOpenChange(true);
  };

  const handleSelectDate = (date: Date) => {
    const { startDate, endDate } = draftValue;

    if (activeField === 'end') {
      if (startDate && date < startDate) {
        setDraftValue({ startDate: date, endDate: startDate });
      } else {
        setDraftValue({ startDate: startDate ?? date, endDate: date });
      }
      return;
    }

    if (!startDate || (startDate && endDate)) {
      setDraftValue({ startDate: date, endDate: null });
      return;
    }

    if (date < startDate) {
      setDraftValue({ startDate: date, endDate: startDate });
      return;
    }

    setDraftValue({ startDate, endDate: date });
  };

  const handleSubmit = () => {
    onChange(draftValue);
    setOpen(false);
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
            prefixSlot={<CalendarMonthIcon className="text-grey-200" />}
            onClick={handleOpenStartPicker}
          />
        </div>
        <div className="h-[1.5px] w-1.5 shrink-0 bg-grey-200" />
        <div className="min-w-0 flex-1">
          <Input
            placeholder="YY.MM.DD"
            readOnly
            value={formatDate(value.endDate)}
            prefixSlot={<CalendarMonthIcon className="text-grey-200" />}
            onClick={handleOpenEndPicker}
          />
        </div>
      </div>
      <BottomSheet
        open={open}
        onOpenChange={handleOpenChange}
        title={
          <DatePickerTitle
            startDate={draftValue.startDate}
            endDate={draftValue.endDate}
          />
        }
        variant="non-modal"
        dismissType="close-button"
      >
        <div className="px-5 pb-20">
          <DatePicker
            year={today.getFullYear()}
            month={today.getMonth() + 1}
            startDate={draftValue.startDate}
            endDate={draftValue.endDate}
            onSelectDate={handleSelectDate}
          />
        </div>
        <div className="fixed inset-x-0 bottom-0 z-10 px-5 pt-2 pb-0.5">
          <Button
            text="입력하기"
            type="secondary"
            disabled={
              activeField === 'start'
                ? !draftValue.startDate
                : !draftValue.startDate || !draftValue.endDate
            }
            onClick={handleSubmit}
            className="w-full"
          />
        </div>
      </BottomSheet>
    </div>
  );
}

export default TripPeriodStep;
