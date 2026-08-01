'use client';

import { useEffect, useState } from 'react';
import { format, isWithinInterval } from 'date-fns';

import CompletionIcon from '@/assets/icons/completion.svg';
import WarningIcon from '@/assets/icons/warning.svg';
import AlertModal from '@/components/alert-modal';
import CtaButtonGroup from '@/components/cta-button-group';
import Header from '@/components/header';
import ScheduleDayBottomSheet from '@/components/schedule-day-bottom-sheet';
import WeekCalendar from '@/components/week-calendar';
import { DayScheduleValueT } from '@/types/schedule';

import ParticipantStatusList from '../../../_common/_components/ParticipantStatusList';
import { ParticipantStatusT } from '../../../_common/_types/participantStatus';
import { DayAvailabilityStatusT } from '../_consts/groupCalendar.const';
import { usePatchPersonalSchedule } from '../_hooks/usePatchPersonalSchedule';

type DayDetailViewProps = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onBack: () => void;
  minDate: Date;
  maxDate: Date;
  getDayStatus: (date: Date) => DayAvailabilityStatusT;
  getDayParticipants: (date: Date) => {
    needsAttention: ParticipantStatusT[];
    available: ParticipantStatusT[];
  };
  getMyDaySchedule: (date: Date) => DayScheduleValueT;
  onScheduleUpdated: () => void;
};

function DayDetailView({
  selectedDate,
  onSelectDate,
  onBack,
  minDate,
  maxDate,
  getDayStatus,
  getDayParticipants,
  getMyDaySchedule,
  onScheduleUpdated,
}: DayDetailViewProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitErrorOpen, setIsSubmitErrorOpen] = useState(false);
  const [scheduleValue, setScheduleValue] = useState(() =>
    getMyDaySchedule(selectedDate),
  );
  const [initialScheduleValue, setInitialScheduleValue] = useState(() =>
    getMyDaySchedule(selectedDate),
  );
  const { needsAttention, available } = getDayParticipants(selectedDate);
  const { patchPersonalScheduleMutation, isPatchPersonalSchedulePending } =
    usePatchPersonalSchedule();

  const isScheduleUnchanged =
    scheduleValue.isUncertain === initialScheduleValue.isUncertain &&
    scheduleValue.morning === initialScheduleValue.morning &&
    scheduleValue.afternoon === initialScheduleValue.afternoon &&
    scheduleValue.evening === initialScheduleValue.evening;

  useEffect(() => {
    setIsEditOpen(false);
    const myDaySchedule = getMyDaySchedule(selectedDate);
    setScheduleValue(myDaySchedule);
    setInitialScheduleValue(myDaySchedule);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

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

      <WeekCalendar
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        isDateDisabled={(date) =>
          !isWithinInterval(date, { start: minDate, end: maxDate })
        }
        getIndicatorProps={(date) => ({
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
          onPrimaryClick={() => {
            // scheduleValue/initialScheduleValue는 selectedDate가 바뀔 때만
            // 갱신된다 — 같은 날짜에서 저장한 직후 시트를 다시 열면 기준값이
            // 갱신 전 값 그대로라, 실제로는 이미 반영된 변경을 "변경 없음"으로
            // 잘못 판단해 저장 버튼이 막히거나 반영 안 된 것처럼 보인다. 여는
            // 시점에 항상 최신 값을 다시 읽는다.
            const freshValue = getMyDaySchedule(selectedDate);
            setScheduleValue(freshValue);
            setInitialScheduleValue(freshValue);
            setIsEditOpen(true);
          }}
        />
      </div>
      <div aria-hidden className="h-14.5 w-full shrink-0 bg-grey-20" />

      <ScheduleDayBottomSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title={
          <div className="px-4 py-2 text-body-01 text-black">일정 수정하기</div>
        }
        value={scheduleValue}
        onChange={setScheduleValue}
        submitLabel="저장하기"
        submitDisabled={isScheduleUnchanged || isPatchPersonalSchedulePending}
        onSubmit={() => {
          patchPersonalScheduleMutation(
            {
              date: format(selectedDate, 'yyyy-MM-dd'),
              value: scheduleValue,
              baseline: initialScheduleValue,
            },
            {
              onSuccess: () => {
                setIsEditOpen(false);
                onScheduleUpdated();
              },
              onError: () => setIsSubmitErrorOpen(true),
            },
          );
        }}
      />

      <AlertModal
        open={isSubmitErrorOpen}
        onOpenChange={setIsSubmitErrorOpen}
        variant="danger"
        title="일정을 저장하지 못했어요"
        description="잠시 후 다시 시도해주세요"
        primaryText="확인"
        onPrimaryClick={() => setIsSubmitErrorOpen(false)}
      />
    </div>
  );
}

export default DayDetailView;
