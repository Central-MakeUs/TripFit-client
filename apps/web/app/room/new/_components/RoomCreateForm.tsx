'use client';

import { useEffect, useState } from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import { useRouter } from 'next/navigation';

import { ApiError } from '@/apis/request';
import AlertModal from '@/components/alert-modal';
import BasicInfo from '@/components/basic-info';
import {
  BasicInfoScreen,
  BasicInfoValue,
  DEFAULT_BASIC_INFO_VALUE,
} from '@/components/basic-info/basicInfo.const';
import CtaButtonGroup from '@/components/cta-button-group';
import Header from '@/components/header';
import ProgressBar from '@/components/progress-bar';
import Spinner from '@/components/spinner';
import { useDeleteAllRegularSchedules } from '@/hooks/useDeleteAllRegularSchedules';
import { useGetScheduleCalendar } from '@/hooks/useGetScheduleCalendar';
import { usePatchPersonalSchedule } from '@/hooks/usePatchPersonalSchedule';
import { useRefreshScheduleStatus } from '@/hooks/useRefreshScheduleStatus';
import { useSaveRegularSchedule } from '@/hooks/useSaveRegularSchedule';
import { useSaveVacationPolicy } from '@/hooks/useSaveVacationPolicy';
import { useAuthStore } from '@/stores/authStore';
import { IndividualScheduleValueT } from '@/types/schedule';
import { cn } from '@/utils/cn';
import { mapRegularScheduleItemToClient } from '@/utils/mapRegularSchedule';
import { mapScheduleCalendarToIndividualScheduleValue } from '@/utils/mapScheduleCalendar';
import { mapVacationPolicyToClient } from '@/utils/mapVacationPolicy';

import ConfirmScheduleModal from '../../_common/_components/ConfirmScheduleModal';
import PreScheduleRequiredModal from '../../_common/_components/PreScheduleRequiredModal';
import ShareSheet from '../../_common/_components/ShareSheet';
import { useGetRoom } from '../../_common/_hooks/useGetRoom';
import { useScheduleConfirmGate } from '../../_common/_hooks/useScheduleConfirmGate';
import {
  isTripDurationValid,
  TripDurationValue,
} from '../../_common/_utils/tripDuration';
import { usePostRoom } from '../_hooks/usePostRoom';
import CompleteStep from './steps/CompleteStep';
import DestinationStep from './steps/DestinationStep';
import ParticipantCountStep from './steps/ParticipantCountStep';
import RoomNameStep from './steps/RoomNameStep';
import TripDurationStep from './steps/TripDurationStep';
import TripPeriodStep, { TripPeriodValue } from './steps/TripPeriodStep';

const TOTAL_STEPS = 6;

type ScheduleModal = 'none' | 'preSchedule' | 'confirmSchedule';

function RoomCreateForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(false);
  const [basicInfoInitialScreen, setBasicInfoInitialScreen] =
    useState<BasicInfoScreen>('hasRegularSchedule');
  const [scheduleModal, setScheduleModal] = useState<ScheduleModal>('none');
  const [roomName, setRoomName] = useState('');
  const [tripPeriod, setTripPeriod] = useState<TripPeriodValue>({
    startDate: null,
    endDate: null,
  });
  const [tripDuration, setTripDuration] = useState<TripDurationValue>({
    nights: '',
    days: '',
  });
  const [participantCount, setParticipantCount] = useState(0);
  const [destination, setDestination] = useState('');
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [isInviteSheetOpen, setIsInviteSheetOpen] = useState(false);
  const [isErrorAlertOpen, setIsErrorAlertOpen] = useState(false);
  const [scheduleErrorMessage, setScheduleErrorMessage] = useState<
    string | null
  >(null);

  const { postRoomMutation, isPostRoomPending } = usePostRoom();
  // postRoom 응답엔 inviteCode가 없어, 방 생성 직후 "참여자 초대하기" 공유 링크에
  // 실을 inviteCode는 별도로 조회해서 가져온다. 다만 이 시점엔 방장이 아직 일정
  // 입력/확인을 안 끝내 방이 활성화(activate) 전이라 이 조회가 SCHEDULE_ACTIVATION_REQUIRED로
  // 실패한다 — activate가 끝난 뒤(handleSaveIndividualSchedule) 명시적으로 다시 불러온다.
  const { roomData: createdRoomData, refetchRoom: refetchCreatedRoom } =
    useGetRoom(createdRoomId ?? '', {
      enabled: !!createdRoomId,
    });
  const { confirmSchedule, confirmErrorModal } = useScheduleConfirmGate();
  const { patchPersonalScheduleMutation } = usePatchPersonalSchedule();
  const { refreshScheduleStatus } = useRefreshScheduleStatus();

  // 사전 일정 입력을 마쳤는지는 hasCompletedPreSchedule 하나로만 판단한다 — 정기
  // 일정 프리페치 여부도 이 값 기준이다.
  const hasCompletedPreSchedule = useAuthStore(
    (state) => state.hasCompletedPreSchedule,
  );
  // hasCompletedPreSchedule는 persist된 store 값이라, 하이드레이션이 끝나기 전엔
  // 이미 사전 일정을 입력한 사용자도 잠깐 기본값(false)으로 보인다 — 그 사이
  // "여행방 바로가기"를 누르면 갱신 입력 대신 최초 입력 모달로 잘못 갈 수 있으므로
  // (RoomDetailSection과 동일한 이유) 하이드레이션 완료 전엔 버튼을 비활성화한다.
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    setHasHydrated(useAuthStore.persist.hasHydrated());
    return useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
  }, []);

  // hasCompletedPreSchedule로 게이팅하지 않는다 — 정기 일정만 저장해두고
  // 연차·휴일 정보는 아직 저장 안 한 사용자는 hasCompletedPreSchedule이
  // false여도 정기 일정 데이터가 실제로 존재할 수 있다(RoomDetailSection과
  // 동일한 이유).
  const {
    regularSchedulesData,
    isRegularSchedulesLoading,
    addRegularSchedule,
    editRegularSchedule,
    removeRegularSchedule,
  } = useSaveRegularSchedule();
  const { deleteAllRegularSchedulesMutation } = useDeleteAllRegularSchedules();
  const { vacationPolicyData, isVacationPolicyLoading, saveVacationPolicy } =
    useSaveVacationPolicy();

  const handleSaveVacationPolicy = async (value: BasicInfoValue) => {
    try {
      await saveVacationPolicy(value);
      await refreshScheduleStatus();
      return true;
    } catch (error) {
      setScheduleErrorMessage(
        error instanceof Error ? error.message : '저장 중 문제가 발생했어요.',
      );
      return false;
    }
  };

  const handleRegularScheduleError = (message: string) => {
    setScheduleErrorMessage(message);
  };

  const { refetchScheduleCalendar } = useGetScheduleCalendar({
    startDate: tripPeriod.startDate
      ? format(tripPeriod.startDate, 'yyyy-MM-dd')
      : '',
    endDate: tripPeriod.endDate ? format(tripPeriod.endDate, 'yyyy-MM-dd') : '',
  });

  const handleBeforeIndividualSchedule = async () => {
    if (!tripPeriod.startDate || !tripPeriod.endDate) return undefined;
    const { data } = await refetchScheduleCalendar();
    if (!data) return undefined;
    return mapScheduleCalendarToIndividualScheduleValue(data.days);
  };

  const handleSaveIndividualSchedule = async (
    value: BasicInfoValue,
    individualScheduleBackdrop: IndividualScheduleValueT,
  ) => {
    try {
      if (Object.keys(value.individualSchedule).length > 0) {
        await patchPersonalScheduleMutation({
          value: value.individualSchedule,
          mergedStatus: individualScheduleBackdrop,
        });
        await refreshScheduleStatus();
      }
    } catch (error) {
      setScheduleErrorMessage(
        error instanceof ApiError && error.code === 'INVALID_INPUT'
          ? '저장 가능한 기간을 벗어났어요.'
          : error instanceof Error
            ? error.message
            : '저장 중 문제가 발생했어요.',
      );
      return false;
    }
    if (!createdRoomId) return false;
    const confirmed = await confirmSchedule(createdRoomId);
    // 활성화가 끝나야 비로소 방 조회(inviteCode 포함)가 성공하므로, 여기서 다시
    // 불러와야 "참여자 초대하기" 링크에 inviteCode가 정상적으로 실린다.
    if (confirmed) await refetchCreatedRoom();
    return confirmed;
  };

  const periodDays =
    tripPeriod.startDate && tripPeriod.endDate
      ? differenceInCalendarDays(tripPeriod.endDate, tripPeriod.startDate) + 1
      : null;

  const handleBack = () => {
    if (step === TOTAL_STEPS) {
      router.push('/');
      return;
    }
    if (step === 1) {
      router.back();
      return;
    }
    setStep((prev) => prev - 1);
  };

  const isNextDisabled = (() => {
    switch (step) {
      case 1:
        return !roomName;
      case 2:
        return !tripPeriod.startDate || !tripPeriod.endDate;
      case 3:
        return !isTripDurationValid(tripDuration, periodDays);
      case 4:
        return participantCount === 0;
      case 5:
        return !destination;
      default:
        return false;
    }
  })();

  const handleCreateRoom = (
    destinationOverride: string | null = destination,
  ) => {
    const isDurationValid = isTripDurationValid(tripDuration, periodDays);

    postRoomMutation(
      {
        title: roomName,
        startDate: tripPeriod.startDate
          ? format(tripPeriod.startDate, 'yyyy-MM-dd')
          : '',
        endDate: tripPeriod.endDate
          ? format(tripPeriod.endDate, 'yyyy-MM-dd')
          : '',
        nights: isDurationValid ? Number(tripDuration.nights) : null,
        days: isDurationValid ? Number(tripDuration.days) : null,
        participantCount,
        destination: destinationOverride?.trim() ? destinationOverride : null,
      },
      {
        onSuccess: (data) => {
          setCreatedRoomId(data.roomId);
          setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
        },
        onError: () => {
          setIsErrorAlertOpen(true);
        },
      },
    );
  };

  const handleNext = () => {
    if (step === 5) {
      handleCreateRoom();
      return;
    }
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleSkip = () => {
    if (step === 3) {
      setTripDuration({ nights: '', days: '' });
      setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
      return;
    }
    if (step === 5) {
      setDestination('');
      handleCreateRoom(null);
      return;
    }
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleGoToRoom = () => {
    // 정기 일정 건수로 재확인하지 않는다 — hasCompletedPreSchedule 하나가
    // 기준이다(RoomDetailSection과 동일한 이유).
    setScheduleModal(
      hasCompletedPreSchedule ? 'confirmSchedule' : 'preSchedule',
    );
  };

  const handleStartBasicInfo = (initialScreen: BasicInfoScreen) => {
    setScheduleModal('none');
    setBasicInfoInitialScreen(initialScreen);
    setIsBasicInfoOpen(true);
  };

  if (isBasicInfoOpen) {
    // 갱신 입력은 scheduleChanged(안내 화면) 또는 regularScheduleDetail(목록
    // 화면) 어느 쪽으로 시작하든 같은 기존 데이터가 필요하다 — 두 값 모두
    // 갱신 입력 진입을 뜻한다.
    const isReturningUserEntry =
      basicInfoInitialScreen === 'scheduleChanged' ||
      basicInfoInitialScreen === 'regularScheduleDetail';

    // "정기 일정이 있나요?"에서 "네"를 고른 최초 입력이어도, 마이페이지 등에서
    // 이미 정기 일정을 저장해뒀을 수 있다(연차·휴일 정보만 아직 저장 안 해
    // hasCompletedPreSchedule은 false인 경우) — 그 데이터를 빈 폼으로 덮어쓰지
    // 않도록 항상 로딩이 끝난 뒤에 위저드를 연다.
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
          initialScreen={basicInfoInitialScreen}
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
          // '정기 일정 있나요' 질문부터 새로 시작하면(=사전 일정 등록이 아예 안 된 신규
          // 유저) 개별 일정 화면도 원래 안내 문구를 그대로 쓰고, 갱신 입력(scheduleChanged
          // 안내 화면 또는 regularScheduleDetail로 바로 진입)이면 어떤 날짜를 다시
          // 확인해야 하는지 알려주는 문구로 바꾼다.
          individualScheduleHeading={
            isReturningUserEntry ? (
              <>
                여행 기간 중 여행이 어렵거나
                <br />
                확실하지 않은 날짜를 알려주세요.
              </>
            ) : undefined
          }
          individualScheduleDescription={
            isReturningUserEntry
              ? '앞서 입력한 출근 날은 여행 불가능한 날짜로 표시해 뒀어요.'
              : undefined
          }
          individualScheduleMinDate={tripPeriod.startDate ?? undefined}
          individualScheduleMaxDate={tripPeriod.endDate ?? undefined}
          onExit={() => setIsBasicInfoOpen(false)}
          onVacationPolicyNext={handleSaveVacationPolicy}
          onDeleteAllRegularSchedules={deleteAllRegularSchedulesMutation}
          onAddRegularSchedule={addRegularSchedule}
          onEditRegularSchedule={editRegularSchedule}
          onRemoveRegularSchedule={removeRegularSchedule}
          onRegularScheduleError={handleRegularScheduleError}
          onBeforeIndividualSchedule={handleBeforeIndividualSchedule}
          onBeforeComplete={handleSaveIndividualSchedule}
          onComplete={() => {}}
          completeTitle="일정 입력하기"
          completeHeading={roomName}
          completeDescription="일정 입력이 완료되었어요!"
          completeShowConfetti
          completePrimaryText="참여자 초대하기"
          onCompletePrimaryClick={() => setIsInviteSheetOpen(true)}
          completeSecondaryText="나중에 할게요"
          onCompleteSecondaryClick={() => {
            if (createdRoomId) router.push(`/room/${createdRoomId}`);
          }}
        />
        {confirmErrorModal}
        <AlertModal
          open={scheduleErrorMessage !== null}
          onOpenChange={(open) => !open && setScheduleErrorMessage(null)}
          variant="danger"
          title="문제가 발생했어요"
          description={scheduleErrorMessage ?? ''}
          primaryText="확인"
          onPrimaryClick={() => setScheduleErrorMessage(null)}
        />
        {createdRoomId && (
          <ShareSheet
            open={isInviteSheetOpen}
            onOpenChange={setIsInviteSheetOpen}
            title="참여자 초대하기"
            initialTitleValue={`${roomName} 초대`}
            initialDescriptionValue="일정 입력하고 같이 여행 떠나자!"
            // 초대 코드는 화면에 노출하지 않고 쿼리 파라미터로만 실어 보낸다 — 방
            // 상세 화면이 이 코드로 POST /api/v1/trips/join을 호출해 참여 처리한다.
            linkPath={`/room/${createdRoomId}${createdRoomData ? `?inviteCode=${createdRoomData.inviteCode}` : ''}`}
            buttonTitle="여행방 참여하기"
            onShare={() => {
              setIsInviteSheetOpen(false);
              router.push(`/room/${createdRoomId}`);
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="sticky top-0 z-10 flex w-full flex-col bg-white">
        <Header variant="page" title="여행방 추가하기" onBack={handleBack} />
        <div className="px-5 py-1">
          <ProgressBar size="sm" value={(step / TOTAL_STEPS) * 100} />
        </div>
      </div>
      <div className="flex w-full flex-1 flex-col px-5">
        <form className="flex w-full flex-1 flex-col">
          {step === 1 && (
            <RoomNameStep value={roomName} onChange={setRoomName} />
          )}
          {step === 2 && (
            <TripPeriodStep value={tripPeriod} onChange={setTripPeriod} />
          )}
          {step === 3 && (
            <TripDurationStep
              value={tripDuration}
              onChange={setTripDuration}
              periodDays={periodDays}
            />
          )}
          {step === 4 && (
            <ParticipantCountStep
              value={participantCount}
              onChange={setParticipantCount}
            />
          )}
          {step === 5 && (
            <DestinationStep value={destination} onChange={setDestination} />
          )}
          {step === 6 && <CompleteStep roomName={roomName} />}
        </form>
        <div
          aria-hidden
          className={cn(
            'w-full shrink-0',
            step === 6 || step === 3 || step === 5 ? 'h-28' : 'h-14.5',
          )}
        />
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full rounded-t-xl bg-white/80 backdrop-blur-[18px] sm:max-w-90">
        {step === 6 ? (
          <CtaButtonGroup
            primaryText="여행방 바로가기"
            primaryColor="secondary"
            primaryDisabled={!hasHydrated}
            onPrimaryClick={handleGoToRoom}
            secondaryText="나중에 할게요"
            secondaryVariant="text-link"
            secondaryIcon={false}
            onSecondaryClick={() => router.push('/')}
          />
        ) : (
          <CtaButtonGroup
            primaryText="다음"
            primaryColor="secondary"
            onPrimaryClick={handleNext}
            primaryDisabled={isNextDisabled || isPostRoomPending}
            secondaryText={
              step === 3 || step === 5 ? '아직 못정했어요' : undefined
            }
            secondaryVariant="text-link"
            secondaryIcon={false}
            onSecondaryClick={handleSkip}
          />
        )}
      </div>
      <PreScheduleRequiredModal
        open={scheduleModal === 'preSchedule'}
        onOpenChange={(open) => !open && setScheduleModal('none')}
        onConfirm={() => handleStartBasicInfo('hasRegularSchedule')}
      />
      <ConfirmScheduleModal
        open={scheduleModal === 'confirmSchedule'}
        onOpenChange={(open) => !open && setScheduleModal('none')}
        onConfirm={() => handleStartBasicInfo('scheduleChanged')}
      />
      <AlertModal
        open={isErrorAlertOpen}
        onOpenChange={setIsErrorAlertOpen}
        variant="danger"
        title="여행방을 만들지 못했어요"
        description="잠시 후 다시 시도해주세요"
        primaryText="확인"
        onPrimaryClick={() => setIsErrorAlertOpen(false)}
      />
    </div>
  );
}

export default RoomCreateForm;
