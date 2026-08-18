'use client';

import { useState } from 'react';
import {
  eachMonthOfInterval,
  format,
  isWithinInterval,
  max,
  parseISO,
  startOfToday,
} from 'date-fns';
import { useRouter } from 'next/navigation';

import SettingsIcon from '@/assets/icons/settings.svg';
import AlertModal from '@/components/alert-modal';
import BasicInfo from '@/components/basic-info';
import {
  BasicInfoValue,
  DEFAULT_BASIC_INFO_VALUE,
} from '@/components/basic-info/basicInfo.const';
import Calendar from '@/components/calendar';
import CheckCompleteStep from '@/components/check-complete-step';
import CtaButtonGroup from '@/components/cta-button-group';
import Header from '@/components/header';
import IconButton from '@/components/icon-button';
import IndividualScheduleInput from '@/components/individual-schedule-input';
import Spinner from '@/components/spinner';
import { useGetScheduleCalendar } from '@/hooks/useGetScheduleCalendar';
import { usePatchPersonalSchedule } from '@/hooks/usePatchPersonalSchedule';
import { useRefreshScheduleStatus } from '@/hooks/useRefreshScheduleStatus';
import { useSaveRegularSchedule } from '@/hooks/useSaveRegularSchedule';
import { useSaveVacationPolicy } from '@/hooks/useSaveVacationPolicy';
import { ParticipantT } from '@/types/participant';
import { RoomT } from '@/types/room';
import { IndividualScheduleValueT } from '@/types/schedule';
import { mapRegularScheduleItemToClient } from '@/utils/mapRegularSchedule';
import { mapScheduleCalendarToIndividualScheduleValue } from '@/utils/mapScheduleCalendar';
import { mapVacationPolicyToClient } from '@/utils/mapVacationPolicy';

import ShareSheet from '../../../_common/_components/ShareSheet';
import { SCHEDULE_REQUEST_SHARE_DESCRIPTION } from '../../../_common/_consts/shareMessages';
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

function GroupCalendarSection({
  room,
  participants,
  capacity,
  isHost,
  isConfirmed,
  onShowRecommendation,
}: GroupCalendarSectionProps) {
  const router = useRouter();
  const minDate = parseISO(room.startDate);
  const maxDate = parseISO(room.endDate);
  const months = eachMonthOfInterval({ start: minDate, end: maxDate });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filter, setFilter] = useState<CalendarFilterT>('all');
  const [isRequestResponseOpen, setIsRequestResponseOpen] = useState(false);
  const {
    roomScheduleCalendarData,
    isGetRoomScheduleCalendarLoading,
    isGetRoomScheduleCalendarError,
    refetchRoomScheduleCalendar,
  } = useGetRoomScheduleCalendar(room.id);
  const [isRepeatScheduleOpen, setIsRepeatScheduleOpen] = useState(false);
  const [isIndividualScheduleOpen, setIsIndividualScheduleOpen] =
    useState(false);
  const [isIndividualScheduleComplete, setIsIndividualScheduleComplete] =
    useState(false);
  const [individualSchedule, setIndividualSchedule] =
    useState<IndividualScheduleValueT>({});
  const [individualScheduleBackdrop, setIndividualScheduleBackdrop] =
    useState<IndividualScheduleValueT>({});
  const [scheduleErrorMessage, setScheduleErrorMessage] = useState<
    string | null
  >(null);
  const [isDurationRequiredModalOpen, setIsDurationRequiredModalOpen] =
    useState(false);

  const {
    regularSchedulesData,
    isRegularSchedulesLoading,
    addRegularSchedule,
    editRegularSchedule,
    removeRegularSchedule,
  } = useSaveRegularSchedule({ enabled: isRepeatScheduleOpen });
  const { vacationPolicyData, isVacationPolicyLoading, saveVacationPolicy } =
    useSaveVacationPolicy({ enabled: isRepeatScheduleOpen });
  const { refreshScheduleStatus } = useRefreshScheduleStatus();
  const { patchPersonalScheduleMutation } = usePatchPersonalSchedule();

  // 여행 예상 기간이 이미 시작된 뒤(minDate가 과거)라도, 개인 일정 조회 API는
  // 오늘 이전 날짜를 시작일로 받지 않으므로 오늘보다 앞서지 않게 clamp한다.
  // (그룹 달력 자체가 쓰는 minDate/maxDate는 과거 날짜도 그대로 보여줘야 해서 안 건드림)
  const { refetchScheduleCalendar } = useGetScheduleCalendar({
    startDate: format(max([startOfToday(), minDate]), 'yyyy-MM-dd'),
    endDate: format(maxDate, 'yyyy-MM-dd'),
  });

  const handleRegularScheduleError = (message: string) => {
    setScheduleErrorMessage(message);
  };

  const handleSaveVacationPolicy = async (value: BasicInfoValue) => {
    try {
      await saveVacationPolicy(value);
      await refreshScheduleStatus();
      refetchRoomScheduleCalendar();
      return true;
    } catch (error) {
      setScheduleErrorMessage(
        error instanceof Error ? error.message : '저장 중 문제가 발생했어요.',
      );
      return false;
    }
  };

  const handleOpenIndividualSchedule = async () => {
    setIndividualSchedule({});
    setIndividualScheduleBackdrop({});
    // 기준값 조회가 실패하면 잘못된(전부 가능 처리된) 기준으로 편집하게 되므로,
    // 조회가 끝나 성공했을 때만 입력 화면으로 들어간다.
    const { data } = await refetchScheduleCalendar();
    if (!data) {
      setScheduleErrorMessage('일정을 불러오지 못했어요.');
      return;
    }
    setIndividualScheduleBackdrop(
      mapScheduleCalendarToIndividualScheduleValue(data.days),
    );
    setIsIndividualScheduleOpen(true);
  };

  const handleSaveIndividualSchedule = async () => {
    try {
      if (Object.keys(individualSchedule).length > 0) {
        await patchPersonalScheduleMutation({
          value: individualSchedule,
          mergedStatus: individualScheduleBackdrop,
        });
        await refreshScheduleStatus();
        refetchRoomScheduleCalendar();
      }
    } catch (error) {
      setScheduleErrorMessage(
        error instanceof Error ? error.message : '저장 중 문제가 발생했어요.',
      );
      return;
    }
    setIsIndividualScheduleComplete(true);
  };

  const respondedCount = room.activeMemberCount;
  // 여행 일수(nights/days)가 정해지지 않은 방은 추천 일정 계산 자체가 불가능하다.
  // 확정된 일정은 확정 시점에 이미 일수가 존재하므로 isConfirmed일 때는 체크하지 않는다.
  const isTripDurationUndecided =
    !isConfirmed && (room.nights === null || room.days === null);

  const handleShowRecommendation = () => {
    if (isTripDurationUndecided) {
      setIsDurationRequiredModalOpen(true);
      return;
    }
    onShowRecommendation();
  };

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

  if (isGetRoomScheduleCalendarLoading) {
    return (
      <div className="flex w-full flex-1 flex-col">
        <Header variant="page" title={room.title} />
        <div className="flex w-full flex-1 items-center justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  if (isGetRoomScheduleCalendarError || !roomScheduleCalendarData) {
    return (
      <div className="flex w-full flex-1 flex-col">
        <Header variant="page" title={room.title} />
        <div className="flex w-full flex-1 items-center justify-center">
          <span className="text-body-03 text-grey-500">
            일정 정보를 불러오지 못했어요
          </span>
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
    if (isRegularSchedulesLoading || isVacationPolicyLoading) {
      return (
        <div className="flex w-full flex-1 items-center justify-center">
          <Spinner />
        </div>
      );
    }

    const savedItems = regularSchedulesData ?? [];
    const vacationPolicyValue = vacationPolicyData
      ? mapVacationPolicyToClient(vacationPolicyData)
      : null;

    return (
      <>
        <BasicInfo
          allowSkip={false}
          title="반복 일정 수정"
          initialScreen="regularScheduleDetail"
          initialValue={{
            ...DEFAULT_BASIC_INFO_VALUE,
            hasRegularSchedule: savedItems.length > 0,
            regularSchedules: savedItems.map(mapRegularScheduleItemToClient),
            annualLeaveCount: vacationPolicyValue?.annualLeaveCount ?? null,
            leaveNoticeDays: vacationPolicyValue?.leaveNoticeDays ?? null,
            includeHalfDayHoliday:
              vacationPolicyValue?.includeHalfDayHoliday ??
              DEFAULT_BASIC_INFO_VALUE.includeHalfDayHoliday,
          }}
          endsAtIncludeHalfDayHoliday
          onExit={() => setIsRepeatScheduleOpen(false)}
          onClose={() => setIsRepeatScheduleOpen(false)}
          onVacationPolicyNext={handleSaveVacationPolicy}
          onAddRegularSchedule={addRegularSchedule}
          onEditRegularSchedule={editRegularSchedule}
          onRemoveRegularSchedule={removeRegularSchedule}
          onRegularScheduleError={handleRegularScheduleError}
          onComplete={() => setIsRepeatScheduleOpen(false)}
          completeTitle="반복 일정 수정"
          completeHeading="반복 일정 수정이 완료되었습니다!"
          completePrimaryText="확인"
        />
        <AlertModal
          open={scheduleErrorMessage !== null}
          onOpenChange={(open) => !open && setScheduleErrorMessage(null)}
          variant="danger"
          title="문제가 발생했어요"
          description={scheduleErrorMessage ?? ''}
          primaryText="확인"
          onPrimaryClick={() => setScheduleErrorMessage(null)}
        />
      </>
    );
  }

  if (isIndividualScheduleOpen) {
    if (isIndividualScheduleComplete) {
      return (
        <CheckCompleteStep
          showHeader
          title="개별 일정 수정"
          onBack={() => {
            setIsIndividualScheduleComplete(false);
            setIsIndividualScheduleOpen(false);
          }}
          onClose={() => {
            setIsIndividualScheduleComplete(false);
            setIsIndividualScheduleOpen(false);
          }}
          heading="개별 일정 수정이 완료되었습니다!"
          primaryText="확인"
          onPrimaryClick={() => {
            setIsIndividualScheduleComplete(false);
            setIsIndividualScheduleOpen(false);
          }}
        />
      );
    }

    return (
      <>
        <IndividualScheduleInput
          title="개별 일정 수정"
          heading={
            <>
              여행 기간 중 여행이 어렵거나
              <br />
              확실하지 않은 날짜를 알려주세요.
            </>
          }
          description="앞서 입력한 출근 날은 여행 불가능한 날짜로 표시해 뒀어요."
          initialYear={minDate.getFullYear()}
          initialMonth={minDate.getMonth() + 1}
          value={individualSchedule}
          onChange={setIndividualSchedule}
          mergedStatus={individualScheduleBackdrop}
          minDate={minDate}
          maxDate={maxDate}
          onBack={() => setIsIndividualScheduleOpen(false)}
          onClose={() => setIsIndividualScheduleOpen(false)}
          onNext={handleSaveIndividualSchedule}
        />
        <AlertModal
          open={scheduleErrorMessage !== null}
          onOpenChange={(open) => !open && setScheduleErrorMessage(null)}
          variant="danger"
          title="문제가 발생했어요"
          description={scheduleErrorMessage ?? ''}
          primaryText="확인"
          onPrimaryClick={() => setScheduleErrorMessage(null)}
        />
      </>
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col">
      <Header
        variant="page"
        titleAlign="left"
        onBack={() => router.push('/')}
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
        <ResponseRateCard respondedCount={respondedCount} capacity={capacity} />
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
              onPrimaryClick={handleShowRecommendation}
            />
          </div>
          <div aria-hidden className="h-15 w-full shrink-0" />
        </>
      )}

      <CalendarFabMenu
        onSelectRepeatSchedule={() => setIsRepeatScheduleOpen(true)}
        onSelectIndividualSchedule={handleOpenIndividualSchedule}
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
        initialDescriptionValue={SCHEDULE_REQUEST_SHARE_DESCRIPTION}
        linkPath={`/room/${room.id}?inviteCode=${room.inviteCode}`}
        buttonTitle="응답하기"
        onShare={() => {
          setIsRequestResponseOpen(false);
        }}
      />

      <AlertModal
        open={isDurationRequiredModalOpen}
        onOpenChange={setIsDurationRequiredModalOpen}
        title="여행 일수를 먼저 정해주세요"
        description={
          <>
            여행 일수가 정해지지 않으면
            <br />
            추천 일정을 확인할 수 없어요.
          </>
        }
        primaryText="여행방 관리로 이동"
        primaryColor="primary"
        onPrimaryClick={() => {
          setIsDurationRequiredModalOpen(false);
          router.push(`/room/${room.id}/manage`);
        }}
      />

      <AlertModal
        open={scheduleErrorMessage !== null}
        onOpenChange={(open) => !open && setScheduleErrorMessage(null)}
        variant="danger"
        title="문제가 발생했어요"
        description={scheduleErrorMessage ?? ''}
        primaryText="확인"
        onPrimaryClick={() => setScheduleErrorMessage(null)}
      />
    </div>
  );
}

export default GroupCalendarSection;
