'use client';

import { useState } from 'react';
import { eachMonthOfInterval, format, isWithinInterval } from 'date-fns';

import SettingsIcon from '@/assets/icons/settings.svg';
import Calendar from '@/components/calendar';
import CtaButtonGroup from '@/components/cta-button-group';
import Header from '@/components/header';
import IconButton from '@/components/icon-button';
import { ParticipantT } from '@/types/participant';
import { RoomT } from '@/types/room';

import CalendarFabMenu from './_components/CalendarFabMenu';
import CalendarFilterBottomSheet, {
  CalendarFilterT,
} from './_components/CalendarFilterBottomSheet';
import CalendarLegend from './_components/CalendarLegend';
import DayDetailView from './_components/DayDetailView';
import ParticipantSummaryRow from './_components/ParticipantSummaryRow';
import ResponseRateCard from './_components/ResponseRateCard';
import { getMockDayAvailabilityStatus } from './_consts/groupCalendar.const';

type GroupCalendarSectionProps = {
  room: RoomT;
  participants: ParticipantT[];
  capacity: number;
  onShowRecommendation: () => void;
};

function GroupCalendarSection({
  room,
  participants,
  capacity,
  onShowRecommendation,
}: GroupCalendarSectionProps) {
  const minDate = new Date(room.startDate);
  const maxDate = new Date(room.endDate);
  const months = eachMonthOfInterval({ start: minDate, end: maxDate });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filter, setFilter] = useState<CalendarFilterT>('all');

  const getDayStatus = (date: Date) => getMockDayAvailabilityStatus(date);

  const handleRequestResponse = () => {
    // TODO: 응답 요청 알림 발송 플로우 연결
  };

  if (selectedDate) {
    return (
      <DayDetailView
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onBack={() => setSelectedDate(null)}
        minDate={minDate}
        maxDate={maxDate}
        getDayStatus={getDayStatus}
      />
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col">
      <Header
        variant="page"
        titleAlign="left"
        title={
          <div className="flex flex-col">
            <span className="text-body-03 text-black">{room.title}</span>
            <span className="text-caption-05 text-grey-400">
              {format(minDate, 'yy.MM.dd')} - {format(maxDate, 'yy.MM.dd')}
            </span>
          </div>
        }
        rightSlot={
          <IconButton
            href={`/room/${room.id}/manage`}
            aria-label="여행방 수정/관리"
            icon={<SettingsIcon className="text-grey-500" />}
          />
        }
      />

      <div className="flex w-full flex-col gap-4 px-5 pt-6 pb-4">
        <ParticipantSummaryRow
          participants={participants}
          onRequestResponse={handleRequestResponse}
        />
        <ResponseRateCard
          respondedCount={participants.length}
          capacity={capacity}
        />
      </div>

      <CalendarLegend onClickFilter={() => setIsFilterOpen(true)} />

      <div className="flex w-full flex-1 flex-col">
        {months.map((month) => (
          <Calendar
            key={month.toISOString()}
            year={month.getFullYear()}
            month={month.getMonth() + 1}
            isDateDisabled={(date) =>
              !isWithinInterval(date, { start: minDate, end: maxDate })
            }
            onClickDay={(date) => setSelectedDate(date)}
            getIndicatorProps={(date) => ({
              variant: 'solid',
              status: getDayStatus(date),
            })}
          />
        ))}
      </div>

      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-10 mx-auto h-20 w-full bg-linear-to-b from-white/0 to-white/40 backdrop-blur-[1px] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black)] [mask-image:linear-gradient(to_bottom,transparent,black)] sm:max-w-90"
      />

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full sm:max-w-90">
        <CtaButtonGroup
          primaryText="추천 일정 확인하기"
          primaryColor="secondary"
          onPrimaryClick={onShowRecommendation}
        />
      </div>
      <div aria-hidden className="h-15 w-full shrink-0" />

      <CalendarFabMenu
        onSelectRepeatSchedule={() => {
          // TODO: 반복 일정 수정 플로우 연결 (근무 일정 관리)
        }}
        onSelectIndividualSchedule={() => {
          // TODO: 개별 일정 수정 플로우 연결
        }}
      />

      <CalendarFilterBottomSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        participants={participants}
        value={filter}
        onChange={setFilter}
      />
    </div>
  );
}

export default GroupCalendarSection;
