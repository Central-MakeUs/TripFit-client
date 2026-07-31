'use client';

import { useState } from 'react';
import { addYears, format, max, parseISO, subDays } from 'date-fns';

import ArrowRightIcon from '@/assets/icons/arrow-right-300.svg';
import AlertModal from '@/components/alert-modal';
import BasicInfo from '@/components/basic-info';
import {
  BasicInfoValue,
  DEFAULT_BASIC_INFO_VALUE,
} from '@/components/basic-info/basicInfo.const';
import CheckCompleteStep from '@/components/check-complete-step';
import Header from '@/components/header';
import IndividualScheduleInput from '@/components/individual-schedule-input';
import Spinner from '@/components/spinner';
import { getScheduleCalendar } from '@/apis/getScheduleCalendar';
import { TripHomeCardT } from '@/apis/getTrips';
import { useGetTrips } from '@/hooks/useGetTrips';
import { usePatchPersonalSchedule } from '@/hooks/usePatchPersonalSchedule';
import { useRefreshScheduleStatus } from '@/hooks/useRefreshScheduleStatus';
import { useSaveRegularSchedule } from '@/hooks/useSaveRegularSchedule';
import { IndividualScheduleValueT } from '@/types/schedule';
import { cn } from '@/utils/cn';
import {
  getIncludeHalfDayHolidayFromRegularSchedules,
  getLeaveNoticeDaysFromRegularSchedules,
  mapRegularScheduleItemToClient,
} from '@/utils/mapRegularSchedule';
import { mapScheduleCalendarToIndividualScheduleValue } from '@/utils/mapScheduleCalendar';

const MENU_ITEMS = [
  {
    key: 'calendar',
    title: '캘린더 연동하기',
    description: '구글 캘린더를 연동해 편하게 여행 일정을 관리하세요',
  },
  {
    key: 'schedule',
    title: '내 일정 입력하기',
    description: '내 일정을 업데이트하고 추천 여행 일정을 받아보세요',
  },
  {
    key: 'basicInfo',
    title: '기본 정보 관리',
    description: '정기 일정과 연차 조건을 설정할 수 있어요',
  },
] as const;

function MyScheduleSection() {
  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(false);
  const [isCalendarConnectOpen, setIsCalendarConnectOpen] = useState(false);
  const [isIndividualScheduleOpen, setIsIndividualScheduleOpen] =
    useState(false);
  const [isIndividualScheduleComplete, setIsIndividualScheduleComplete] =
    useState(false);
  const [individualSchedule, setIndividualSchedule] =
    useState<IndividualScheduleValueT>({});
  const [individualScheduleBackdrop, setIndividualScheduleBackdrop] =
    useState<IndividualScheduleValueT>({});
  // 여행 칩은 별도 API를 호출하는 게 아니라, 같은 개인 일정 달력을 어느 여행
  // 기간부터 보여줄지 정하는 화면 전용 선택 상태다 — 이 화면 밖에서 쓰이지
  // 않으므로 전역 상태(zustand)로 뺄 이유 없이 로컬 state로 충분하다.
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { tripsData } = useGetTrips({ scope: 'ongoing' });
  const tripOptions = (tripsData ?? []).map((trip) => ({
    id: trip.tripId,
    title: trip.name,
  }));
  const selectedTrip =
    tripsData?.find((trip) => trip.tripId === selectedTripId) ??
    tripsData?.[0] ??
    null;

  const {
    regularSchedulesData,
    isRegularSchedulesLoading,
    saveRegularSchedule,
  } = useSaveRegularSchedule();
  const { refreshScheduleStatus } = useRefreshScheduleStatus();
  const { patchPersonalScheduleMutation } = usePatchPersonalSchedule();

  const today = new Date();

  // 칩으로 고른 여행 기간에 맞춰 그때그때 새로 조회한다 — 개인 일정 달력
  // API는 오늘~오늘+2년-1일까지만 허용하지만, 그 여행의 희망 기간 종료일이
  // 그보다 뒤면 그 날짜까지 상한이 늘어난다. 이미 불러온 다른 기간의
  // baseline은 덮어쓰지 않고 합쳐서, 그 기간에 입력해둔 편집이 나중에
  // 저장할 때도 올바른 기준값으로 비교되게 한다.
  const loadScheduleCalendarForTrip = async (
    trip: TripHomeCardT | null,
  ): Promise<boolean> => {
    const defaultEnd = subDays(addYears(today, 2), 1);
    const endDate = trip
      ? max([defaultEnd, parseISO(trip.endRange)])
      : defaultEnd;
    try {
      const data = await getScheduleCalendar({
        startDate: format(today, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
      });
      setIndividualScheduleBackdrop((prev) => ({
        ...prev,
        ...mapScheduleCalendarToIndividualScheduleValue(data.days),
      }));
      return true;
    } catch (error) {
      // 기준값 조회가 실패한 채로 진행하면 모든 날짜가 기본값(가능)으로
      // 취급돼, 실제 서버 상태와 다른 기준으로 편집·저장될 수 있다.
      setErrorMessage(
        error instanceof Error ? error.message : '일정을 불러오지 못했어요.',
      );
      return false;
    }
  };

  const handleSelectTrip = (tripId: string) => {
    setSelectedTripId(tripId);
    const trip = tripsData?.find((item) => item.tripId === tripId) ?? null;
    loadScheduleCalendarForTrip(trip);
  };

  const handleSaveRegularSchedule = async (value: BasicInfoValue) => {
    try {
      await saveRegularSchedule(value);
      await refreshScheduleStatus();
      return true;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '저장 중 문제가 발생했어요.',
      );
      return false;
    }
  };

  const handleOpenIndividualSchedule = async () => {
    setIndividualSchedule({});
    setIndividualScheduleBackdrop({});
    const defaultTrip = tripsData?.[0] ?? null;
    setSelectedTripId(defaultTrip?.tripId ?? null);
    // 기준값 조회에 실패하면 잘못된(전부 가능 처리된) 기준으로 편집하게 되므로,
    // 조회가 끝나 성공했을 때만 입력 화면으로 들어간다.
    const success = await loadScheduleCalendarForTrip(defaultTrip);
    if (success) {
      setIsIndividualScheduleOpen(true);
    }
  };

  const handleSaveIndividualSchedule = async () => {
    try {
      if (Object.keys(individualSchedule).length > 0) {
        await patchPersonalScheduleMutation({
          value: individualSchedule,
          mergedStatus: individualScheduleBackdrop,
        });
        await refreshScheduleStatus();
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '저장 중 문제가 발생했어요.',
      );
      return;
    }
    setIsIndividualScheduleComplete(true);
  };

  const calendarStartDate = selectedTrip
    ? max([today, parseISO(selectedTrip.startRange)])
    : today;

  if (isCalendarConnectOpen) {
    return (
      <BasicInfo
        initialScreen="calendarConnectIntro"
        onExit={() => setIsCalendarConnectOpen(false)}
        onComplete={() => setIsCalendarConnectOpen(false)}
      />
    );
  }

  if (isIndividualScheduleOpen) {
    if (isIndividualScheduleComplete) {
      return (
        <CheckCompleteStep
          showHeader
          title="내 일정 입력하기"
          onBack={() => {
            setIsIndividualScheduleComplete(false);
            setIsIndividualScheduleOpen(false);
          }}
          heading="일정 입력이 완료되었어요!"
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
          tripOptions={tripOptions}
          selectedTripId={selectedTrip?.tripId}
          onSelectTrip={handleSelectTrip}
          initialYear={calendarStartDate.getFullYear()}
          initialMonth={calendarStartDate.getMonth() + 1}
          heading={
            <>
              여행 기간 중 여행이 어렵거나
              <br />
              확실하지 않은 날짜를 알려주세요.
            </>
          }
          description="앞서 입력한 출근 날은 여행 불가능한 날짜로 표시해 뒀어요."
          value={individualSchedule}
          onChange={setIndividualSchedule}
          mergedStatus={individualScheduleBackdrop}
          onBack={() => setIsIndividualScheduleOpen(false)}
          onNext={handleSaveIndividualSchedule}
        />
        <AlertModal
          open={errorMessage !== null}
          onOpenChange={(open) => !open && setErrorMessage(null)}
          variant="danger"
          title="문제가 발생했어요"
          description={errorMessage ?? ''}
          primaryText="확인"
          onPrimaryClick={() => setErrorMessage(null)}
        />
      </>
    );
  }

  if (isBasicInfoOpen) {
    if (isRegularSchedulesLoading) {
      return (
        <div className="flex w-full flex-1 items-center justify-center">
          <Spinner />
        </div>
      );
    }

    const items = regularSchedulesData ?? [];
    return (
      <>
        <BasicInfo
          allowSkip={false}
          title="기본 정보 관리"
          initialScreen="regularScheduleDetail"
          initialValue={{
            ...DEFAULT_BASIC_INFO_VALUE,
            hasRegularSchedule: items.length > 0,
            regularSchedules: items.map(mapRegularScheduleItemToClient),
            annualLeaveCount: items[0]?.maxVacationDays ?? null,
            leaveNoticeDays: getLeaveNoticeDaysFromRegularSchedules(items),
            includeHalfDayHoliday:
              getIncludeHalfDayHolidayFromRegularSchedules(items),
          }}
          endsAtIncludeHalfDayHoliday
          onExit={() => setIsBasicInfoOpen(false)}
          onRegularScheduleNext={handleSaveRegularSchedule}
          onComplete={() => setIsBasicInfoOpen(false)}
          completeTitle="기본 정보 관리"
          completeHeading="기본 정보 수정이 완료되었어요!"
          completePrimaryText="확인"
        />
        <AlertModal
          open={errorMessage !== null}
          onOpenChange={(open) => !open && setErrorMessage(null)}
          variant="danger"
          title="문제가 발생했어요"
          description={errorMessage ?? ''}
          primaryText="확인"
          onPrimaryClick={() => setErrorMessage(null)}
        />
      </>
    );
  }

  const handleClickItem = (key: (typeof MENU_ITEMS)[number]['key']) => {
    if (key === 'basicInfo') {
      setIsBasicInfoOpen(true);
      return;
    }
    if (key === 'calendar') {
      setIsCalendarConnectOpen(true);
      return;
    }
    if (key === 'schedule') {
      handleOpenIndividualSchedule();
      return;
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col bg-grey-20">
      <Header variant="page" title="내 일정 관리" background="grey-20" />
      <div className="flex w-full flex-1 flex-col px-5 py-3">
        <ul className="flex w-full flex-col overflow-hidden rounded-2xl">
          {MENU_ITEMS.map((item, index) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => handleClickItem(item.key)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-1 bg-white p-4',
                  index < MENU_ITEMS.length - 1 && 'border-b border-grey-50',
                )}
              >
                <div className="flex flex-1 flex-col items-start gap-0.5 text-left">
                  <span className="text-body-05 text-black">{item.title}</span>
                  <span className="text-caption-03 text-grey-500">
                    {item.description}
                  </span>
                </div>
                <ArrowRightIcon className="size-4 shrink-0 text-grey-300" />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <AlertModal
        open={errorMessage !== null}
        onOpenChange={(open) => !open && setErrorMessage(null)}
        variant="danger"
        title="문제가 발생했어요"
        description={errorMessage ?? ''}
        primaryText="확인"
        onPrimaryClick={() => setErrorMessage(null)}
      />
    </div>
  );
}

export default MyScheduleSection;
