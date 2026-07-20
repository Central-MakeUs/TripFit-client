'use client';

import { useState } from 'react';
import { format } from 'date-fns';

import CompletionIcon from '@/assets/icons/completion.svg';
import WarningIcon from '@/assets/icons/warning.svg';
import CtaButtonGroup from '@/components/cta-button-group';
import Header from '@/components/header';
import ScheduleDayBottomSheet from '@/components/schedule-day-bottom-sheet';
import { DayScheduleValueT } from '@/types/schedule';

import ParticipantStatusList from '../../../_common/_components/ParticipantStatusList';
import { DayAvailabilityStatusT } from '../_consts/groupCalendar.const';
import { MOCK_DAY_DETAIL } from '../_mocks/dayDetail';
import WeekStrip from './WeekStrip';

type DayDetailViewProps = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onBack: () => void;
  minDate: Date;
  maxDate: Date;
  getDayStatus: (date: Date) => DayAvailabilityStatusT;
};

const INITIAL_SCHEDULE_VALUE: DayScheduleValueT = {
  isUncertain: false,
  morning: 'available',
  afternoon: 'available',
  evening: 'available',
};

function DayDetailView({
  selectedDate,
  onSelectDate,
  onBack,
  minDate,
  maxDate,
  getDayStatus,
}: DayDetailViewProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [scheduleValue, setScheduleValue] = useState(INITIAL_SCHEDULE_VALUE);
  const { needsAttention, available } = MOCK_DAY_DETAIL;

  const isScheduleUnchanged =
    scheduleValue.isUncertain === INITIAL_SCHEDULE_VALUE.isUncertain &&
    scheduleValue.morning === INITIAL_SCHEDULE_VALUE.morning &&
    scheduleValue.afternoon === INITIAL_SCHEDULE_VALUE.afternoon &&
    scheduleValue.evening === INITIAL_SCHEDULE_VALUE.evening;

  return (
    <div className="flex w-full flex-1 flex-col">
      <Header
        variant="page"
        titleAlign="left"
        title={
          <span className="text-body-01 text-black">
            {format(selectedDate, 'M월')}
          </span>
        }
        onBack={onBack}
      />

      <WeekStrip
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        isDateDisabled={(date) => date < minDate || date > maxDate}
        getIndicatorProps={(date) => ({
          variant: 'solid',
          status: getDayStatus(date),
        })}
      />

      <div className="flex w-full flex-1 flex-col bg-grey-20">
        <div className="px-5 pt-5 pb-7">
          <ParticipantStatusList
            icon={<WarningIcon className="size-5 text-red-300" />}
            title={`주의가 필요한 인원 ${needsAttention.length}명`}
            participants={needsAttention}
            titleColorClassName="text-black"
            reasonColorClassName="text-grey-400"
            listClassName="mt-3 overflow-hidden bg-white"
          />
        </div>
        <div className="px-5 pb-7">
          <ParticipantStatusList
            icon={<CompletionIcon className="size-6 text-[#68E494]" />}
            title={`참석 가능한 인원 ${available.length}명`}
            participants={available}
            titleColorClassName="text-black"
            reasonColorClassName="text-grey-500"
            listClassName="mt-3 overflow-hidden bg-white"
          />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full bg-grey-20 sm:max-w-90">
        <CtaButtonGroup
          primaryText="일정 수정하기"
          primaryColor="secondary"
          onPrimaryClick={() => setIsEditOpen(true)}
        />
      </div>
      <div aria-hidden className="h-[58px] w-full shrink-0 bg-grey-20" />

      <ScheduleDayBottomSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title={
          <div className="px-4 py-2 text-body-01 text-black">일정 수정하기</div>
        }
        value={scheduleValue}
        onChange={setScheduleValue}
        submitLabel="저장하기"
        submitDisabled={isScheduleUnchanged}
        onSubmit={() => {
          // TODO: 날짜별 일정 수정 API 연동
          setIsEditOpen(false);
        }}
      />
    </div>
  );
}

export default DayDetailView;
