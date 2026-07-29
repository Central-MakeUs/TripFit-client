'use client';

import { useState } from 'react';
import { eachMonthOfInterval, format, isWithinInterval } from 'date-fns';

import SettingsIcon from '@/assets/icons/settings.svg';
import BasicInfo from '@/components/basic-info';
import { DEFAULT_BASIC_INFO_VALUE } from '@/components/basic-info/basicInfo.const';
import Calendar from '@/components/calendar';
import CtaButtonGroup from '@/components/cta-button-group';
import Header from '@/components/header';
import IconButton from '@/components/icon-button';
import IndividualScheduleInput from '@/components/individual-schedule-input';
import Spinner from '@/components/spinner';
import { ParticipantT } from '@/types/participant';
import { RoomT } from '@/types/room';
import { IndividualScheduleValueT, RegularScheduleT } from '@/types/schedule';

import ShareSheet from '../../_common/_components/ShareSheet';
import CalendarFabMenu from './_components/CalendarFabMenu';
import CalendarFilterBottomSheet, {
  CalendarFilterT,
} from './_components/CalendarFilterBottomSheet';
import CalendarLegend from './_components/CalendarLegend';
import DayDetailView from './_components/DayDetailView';
import ParticipantSummaryRow from './_components/ParticipantSummaryRow';
import ResponseRateCard from './_components/ResponseRateCard';
import { useGetRoomScheduleCalendar } from './_hooks/useGetRoomScheduleCalendar';
import { getDayAvailabilityStatus } from './_utils/getDayAvailabilityStatus';
import { getDayDetailParticipants } from './_utils/getDayDetailParticipants';
import {
  DEFAULT_DAY_SCHEDULE_VALUE,
  getMyDaySchedule,
} from './_utils/getMyDaySchedule';

type GroupCalendarSectionProps = {
  room: RoomT;
  participants: ParticipantT[];
  capacity: number;
  isHost: boolean;
  isConfirmed: boolean;
  onShowRecommendation: () => void;
};

// TODO: 참여 중인 여행 목록 조회 API 연동 전까지 임시로 고정
const MOCK_OTHER_TRIPS = [
  { id: 'mock-other-1', title: '나트랑 여행' },
  { id: 'mock-other-2', title: '전주 여행' },
];

// TODO: 근무 일정 저장 여부 조회 API 연동 후 실제 저장된 값으로 대체
const MOCK_SAVED_REGULAR_SCHEDULES: RegularScheduleT[] = [
  { id: 'mock-1', days: [1, 2, 3], startTime: '09:30', endTime: '18:00' },
];

function GroupCalendarSection({
  room,
  participants,
  capacity,
  isHost,
  isConfirmed,
  onShowRecommendation,
}: GroupCalendarSectionProps) {
  const minDate = new Date(room.startDate);
  const maxDate = new Date(room.endDate);
  const months = eachMonthOfInterval({ start: minDate, end: maxDate });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filter, setFilter] = useState<CalendarFilterT>('all');
  const [isRequestResponseOpen, setIsRequestResponseOpen] = useState(false);
  const {
    roomScheduleCalendarData,
    isGetRoomScheduleCalendarLoading,
    refetchRoomScheduleCalendar,
  } = useGetRoomScheduleCalendar(room.id);
  const [isRepeatScheduleOpen, setIsRepeatScheduleOpen] = useState(false);
  const [isIndividualScheduleOpen, setIsIndividualScheduleOpen] =
    useState(false);
  const [individualScheduleByTrip, setIndividualScheduleByTrip] = useState<
    Record<string, IndividualScheduleValueT>
  >({});
  const [selectedTripId, setSelectedTripId] = useState(room.id);

  const tripOptions = [{ id: room.id, title: room.title }, ...MOCK_OTHER_TRIPS];

  const getDayStatus = (date: Date) =>
    roomScheduleCalendarData
      ? getDayAvailabilityStatus(roomScheduleCalendarData, date)
      : 'unavailable';

  const getDayParticipants = (date: Date) =>
    roomScheduleCalendarData
      ? getDayDetailParticipants(roomScheduleCalendarData, participants, date)
      : { needsAttention: [], available: [] };

  const getMyDayScheduleValue = (date: Date) =>
    roomScheduleCalendarData
      ? getMyDaySchedule(roomScheduleCalendarData, date)
      : DEFAULT_DAY_SCHEDULE_VALUE;

  if (isGetRoomScheduleCalendarLoading || !roomScheduleCalendarData) {
    return (
      <div className="flex w-full flex-1 flex-col">
        <Header variant="page" title={room.title} />
        <div className="flex w-full flex-1 items-center justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  if (selectedDate) {
    return (
      <DayDetailView
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onBack={() => setSelectedDate(null)}
        minDate={minDate}
        maxDate={maxDate}
        getDayStatus={getDayStatus}
        getDayParticipants={getDayParticipants}
        getMyDaySchedule={getMyDayScheduleValue}
        onScheduleUpdated={refetchRoomScheduleCalendar}
      />
    );
  }

  if (isRepeatScheduleOpen) {
    return (
      <BasicInfo
        allowSkip={false}
        initialScreen="regularScheduleDetail"
        initialValue={{
          ...DEFAULT_BASIC_INFO_VALUE,
          hasRegularSchedule: true,
          regularSchedules: MOCK_SAVED_REGULAR_SCHEDULES,
        }}
        onExit={() => setIsRepeatScheduleOpen(false)}
        onComplete={() => {
          // TODO: 근무 일정 저장 API 연동
          setIsRepeatScheduleOpen(false);
        }}
      />
    );
  }

  if (isIndividualScheduleOpen) {
    return (
      <IndividualScheduleInput
        tripOptions={tripOptions}
        selectedTripId={selectedTripId}
        onSelectTrip={setSelectedTripId}
        value={individualScheduleByTrip[selectedTripId] ?? {}}
        onChange={(nextValue) =>
          setIndividualScheduleByTrip((prev) => ({
            ...prev,
            [selectedTripId]: nextValue,
          }))
        }
        onBack={() => setIsIndividualScheduleOpen(false)}
        onNext={() => {
          // TODO: 개별 일정 저장 API 연동
          setIsIndividualScheduleOpen(false);
        }}
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
          onRequestResponse={() => setIsRequestResponseOpen(true)}
        />
        <ResponseRateCard
          respondedCount={participants.length}
          capacity={capacity}
        />
      </div>

      <CalendarLegend onClickFilter={() => setIsFilterOpen(true)} />

      <div className="flex w-full flex-1 flex-col px-5 py-4">
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
              status: getDayStatus(date),
            })}
          />
        ))}
      </div>

      {(isHost || isConfirmed) && (
        <>
          <div
            aria-hidden
            className="pointer-events-none fixed inset-x-0 bottom-0 z-10 mx-auto h-20 w-full bg-linear-to-b from-white/0 to-white/40 backdrop-blur-[1px] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black)] mask-[linear-gradient(to_bottom,transparent,black)] sm:max-w-90"
          />

          <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full sm:max-w-90">
            <CtaButtonGroup
              primaryText={
                isConfirmed ? '확정된 일정 확인하기' : '추천 일정 확인하기'
              }
              primaryColor="secondary"
              onPrimaryClick={onShowRecommendation}
            />
          </div>
          <div aria-hidden className="h-15 w-full shrink-0" />
        </>
      )}

      <CalendarFabMenu
        onSelectRepeatSchedule={() => setIsRepeatScheduleOpen(true)}
        onSelectIndividualSchedule={() => setIsIndividualScheduleOpen(true)}
      />

      <CalendarFilterBottomSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        participants={participants}
        value={filter}
        onChange={setFilter}
      />

      <ShareSheet
        open={isRequestResponseOpen}
        onOpenChange={setIsRequestResponseOpen}
        title="응답 요청하기"
        initialTitleValue={`${room.title} 일정 입력 요청`}
        initialDescriptionValue="아직 일정 입력 안 한 사람들은 얼른 입력해줘!"
        onShare={() => {
          // TODO: 응답 요청 알림 발송 API/카카오톡 공유 연동
          setIsRequestResponseOpen(false);
        }}
      />
    </div>
  );
}

export default GroupCalendarSection;
