'use client';

import { useEffect, useState } from 'react';
import { addYears, format, max, parseISO, subDays } from 'date-fns';
import { useRouter } from 'next/navigation';

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
import { useDeleteGoogleCalendar } from '@/hooks/useDeleteGoogleCalendar';
import { useGetTrips } from '@/hooks/useGetTrips';
import { useGoogleCalendarConnect } from '@/hooks/useGoogleCalendarConnect';
import { usePatchPersonalSchedule } from '@/hooks/usePatchPersonalSchedule';
import { useRefreshScheduleStatus } from '@/hooks/useRefreshScheduleStatus';
import { useSaveRegularSchedule } from '@/hooks/useSaveRegularSchedule';
import { useAuthStore } from '@/stores/authStore';
import { IndividualScheduleValueT } from '@/types/schedule';
import { cn } from '@/utils/cn';
import {
  getIncludeHalfDayHolidayFromRegularSchedules,
  getLeaveNoticeDaysFromRegularSchedules,
  mapRegularScheduleItemToClient,
} from '@/utils/mapRegularSchedule';
import { mapScheduleCalendarToIndividualScheduleValue } from '@/utils/mapScheduleCalendar';
import { consumeCalendarConnectResumeScreen } from '@/utils/oauthState';

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
  const router = useRouter();

  const {
    connectGoogleCalendar,
    isKakaoBrowserAlertOpen,
    closeKakaoBrowserAlert,
  } = useGoogleCalendarConnect();
  const isGoogleCalendarConnected = useAuthStore(
    (state) => state.isGoogleCalendarConnected,
  );
  const setGoogleCalendarConnected = useAuthStore(
    (state) => state.setGoogleCalendarConnected,
  );
  const { deleteGoogleCalendarMutation, isDeleteGoogleCalendarPending } =
    useDeleteGoogleCalendar();
  // 해제 성공은 메뉴 항목 문구가 조용히 바뀌는 것 말고는 눈에 띄는 피드백이 없어서,
  // 실제로 해제됐는지 사용자가 확신하기 어려웠다 — 그렇다고 확인 모달을 닫고 별도의
  // 완료 모달을 새로 여는 건 두 모달이 연달아 여닫히며 전환이 뚝뚝 끊겨 보인다.
  // 같은 모달 인스턴스를 열어둔 채 내용만 확인→완료로 바꿔치기한다.
  const [disconnectModalStep, setDisconnectModalStep] = useState<
    'confirm' | 'success' | null
  >(null);
  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(false);
  const [isCalendarConnectOpen, setIsCalendarConnectOpen] = useState(false);
  // 구글 캘린더 연동은 페이지 전체 리다이렉트(구글 OAuth) 왕복이 필요해 이 컴포넌트의
  // state가 초기화된다 — 떠나기 직전 세션 저장소에 남겨둔 1회성 값을 마운트 시 소비해
  // 캘린더 연동 완료 화면부터 다시 연다. URL 쿼리로 이 신호를 실어 보내던 예전 방식은
  // 이후 무관한 재방문에서도 같은 쿼리 상태가 다시 나타나 매번 완료 화면이 뜨는
  // 문제가 있었다.
  const [calendarConnectResumeScreen, setCalendarConnectResumeScreen] =
    useState<string | null>(null);

  useEffect(() => {
    const resumeScreen = consumeCalendarConnectResumeScreen();
    if (resumeScreen !== 'calendarConnectComplete') return;
    setCalendarConnectResumeScreen(resumeScreen);
    setIsCalendarConnectOpen(true);
  }, []);
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

  // 캘린더 연동 직후 서버가 구글 일정을 동기화해 hasPreSchedule/isAllFree가 바뀔 수
  // 있는데, 브라우저 리다이렉트로 돌아온 경우(위 useEffect가 이 값을 채움)엔 그 시점의
  // accessToken 응답을 다시 받을 방법이 없어 이 상태가 갱신 안 된 채로 남는다 —
  // calendarConnectResumeScreen이 채워지는 시점에 맞춰 한 번 더 재조회한다.
  useEffect(() => {
    if (calendarConnectResumeScreen !== 'calendarConnectComplete') return;
    refreshScheduleStatus();
  }, [calendarConnectResumeScreen, refreshScheduleStatus]);

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

  const handleConnectGoogleCalendar = async () => {
    try {
      const isConnected = await connectGoogleCalendar(
        '/my-schedule',
        'calendarConnectComplete',
      );
      // 앱(네이티브) 플로우는 페이지 이동 없이 이 자리에서 바로 성공 여부를 알 수
      // 있으므로, 위 useEffect(브라우저 리다이렉트 전용)를 기다리지 않고 여기서
      // 곧장 재조회한다.
      if (isConnected) await refreshScheduleStatus();
      return isConnected;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '구글 캘린더 연동에 실패했어요.',
      );
      return false;
    }
  };

  // calendarMaxDate/개별 일정 배경값은 모두 selectedTripId에서 파생되므로,
  // 조회가 끝나기 전에 먼저 selectedTripId부터 바꿔버리면 "캘린더 노출 범위는
  // 이미 새 여행 기준으로 넓어졌는데 그 구간의 배경값은 아직 안 채워진" 순간이
  // 생긴다 — 조회가 성공했을 때만 선택을 반영해 그 틈 자체를 없앤다. 실패하면
  // loadScheduleCalendarForTrip이 이미 에러 알럿을 띄우고, selectedTripId는
  // 이전 값 그대로라 범위도 이전 상태로 유지된다.
  const handleSelectTrip = async (tripId: string) => {
    const trip = tripsData?.find((item) => item.tripId === tripId) ?? null;
    const success = await loadScheduleCalendarForTrip(trip);
    if (success) {
      setSelectedTripId(tripId);
    }
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

  // 마이페이지의 개인 일정은 특정 여행방에 종속되지 않으므로, 선택된 여행의
  // 시작월과 무관하게 항상 오늘이 속한 달부터 보여준다 — 여행 시작월로 미리
  // 스크롤을 넘겨버리면(무한 스크롤이 뒤로는 못 가는 구조라) 그 이전 달은 아예
  // 확인할 수 없게 된다. 노출 상한만 "오늘+2년"과 여행 종료일 중 더 늦은
  // 날짜로 넓힌다.
  const calendarMaxDate = selectedTrip
    ? max([subDays(addYears(today, 2), 1), parseISO(selectedTrip.endRange)])
    : subDays(addYears(today, 2), 1);

  if (isCalendarConnectOpen) {
    return (
      <>
        <BasicInfo
          initialScreen={
            calendarConnectResumeScreen === 'calendarConnectComplete'
              ? 'calendarConnectComplete'
              : 'calendarConnectIntro'
          }
          onConnectGoogleCalendar={handleConnectGoogleCalendar}
          onExit={() => setIsCalendarConnectOpen(false)}
          onComplete={() => setIsCalendarConnectOpen(false)}
        />
        <AlertModal
          open={isKakaoBrowserAlertOpen}
          onOpenChange={(open) => !open && closeKakaoBrowserAlert()}
          title="다른 브라우저에서 열어주세요"
          description="하단의 공유 아이콘을 눌러 'Safari에서 열기'를 선택해주세요."
          primaryText="확인"
          onPrimaryClick={closeKakaoBrowserAlert}
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

  if (isIndividualScheduleOpen) {
    if (isIndividualScheduleComplete) {
      return (
        <CheckCompleteStep
          showHeader
          title="내 일정 입력하기"
          onBack={() => setIsIndividualScheduleComplete(false)}
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
          maxDate={calendarMaxDate}
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
      if (isGoogleCalendarConnected) {
        setDisconnectModalStep('confirm');
        return;
      }
      setIsCalendarConnectOpen(true);
      return;
    }
    if (key === 'schedule') {
      handleOpenIndividualSchedule();
      return;
    }
  };

  const handleDisconnectCalendar = () => {
    // AlertModal은 버튼 비활성화 prop이 없어, "해제"를 빠르게 두 번 누르면 요청이
    // 중복 전송될 수 있다 — 첫 요청이 아직 진행 중이면 무시한다.
    if (isDeleteGoogleCalendarPending) return;
    deleteGoogleCalendarMutation(undefined, {
      onSuccess: () => {
        setGoogleCalendarConnected(false);
        setDisconnectModalStep('success');
      },
      onError: (error) => {
        setDisconnectModalStep(null);
        setErrorMessage(error.message);
      },
    });
  };

  const menuItems = MENU_ITEMS.map((item) =>
    item.key === 'calendar' && isGoogleCalendarConnected
      ? {
          ...item,
          title: '구글 캘린더 연동됨',
          description: '연동을 해제하려면 눌러주세요',
        }
      : item,
  );

  return (
    <div className="flex w-full flex-1 flex-col bg-grey-20">
      <Header
        variant="page"
        title="내 일정 관리"
        background="grey-20"
        // 기본 뒤로가기(router.back())는 브라우저 히스토리를 그대로 따라가는데,
        // 캘린더 연동을 거치고 온 경우 구글 자신의 페이지(계정 선택·동의 화면)가
        // 히스토리에 남아있어 그리로 가버린다 — /my-schedule은 홈에서만 진입하는
        // 경로라 항상 홈으로 고정한다.
        onBack={() => router.push('/')}
      />
      <div className="flex w-full flex-1 flex-col px-5 py-3">
        <ul className="flex w-full flex-col overflow-hidden rounded-2xl">
          {menuItems.map((item, index) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => handleClickItem(item.key)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-1 bg-white p-4',
                  index < menuItems.length - 1 && 'border-b border-grey-50',
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
      {disconnectModalStep === 'confirm' ? (
        <AlertModal
          open
          onOpenChange={(open) => !open && setDisconnectModalStep(null)}
          title="구글 캘린더 연동을 해제할까요?"
          description={
            <>
              연동을 해제하면 캘린더 기반
              <br />
              일정 반영이 중단돼요
            </>
          }
          secondaryText="취소"
          onSecondaryClick={() => setDisconnectModalStep(null)}
          primaryText="해제"
          primaryColor="primary"
          onPrimaryClick={handleDisconnectCalendar}
        />
      ) : (
        <AlertModal
          open={disconnectModalStep === 'success'}
          onOpenChange={(open) => !open && setDisconnectModalStep(null)}
          title="구글 캘린더 연동이 해제됐어요"
          description="캘린더 기반 일정 반영이 중단됐어요"
          primaryText="확인"
          onPrimaryClick={() => setDisconnectModalStep(null)}
        />
      )}
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
