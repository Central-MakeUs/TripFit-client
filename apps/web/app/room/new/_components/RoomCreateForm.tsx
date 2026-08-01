'use client';

import { useState } from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import { useRouter } from 'next/navigation';

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
import { useGetScheduleCalendar } from '@/hooks/useGetScheduleCalendar';
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

import ConfirmScheduleModal from '../../_common/_components/ConfirmScheduleModal';
import PreScheduleRequiredModal from '../../_common/_components/PreScheduleRequiredModal';
import ShareSheet from '../../_common/_components/ShareSheet';
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
  const { confirmSchedule, confirmErrorModal } = useScheduleConfirmGate();
  const { patchPersonalScheduleMutation } = usePatchPersonalSchedule();
  const { refreshScheduleStatus } = useRefreshScheduleStatus();

  const hasPreSchedule = useAuthStore((state) => state.hasPreSchedule);
  const isAllFree = useAuthStore((state) => state.isAllFree);
  const hasSavedSchedule = hasPreSchedule || isAllFree;

  const {
    regularSchedulesData,
    isRegularSchedulesLoading,
    saveRegularSchedule,
  } = useSaveRegularSchedule({ enabled: hasSavedSchedule });

  const handleSaveRegularSchedule = async (value: BasicInfoValue) => {
    try {
      await saveRegularSchedule(value);
      await refreshScheduleStatus();
      return true;
    } catch (error) {
      setScheduleErrorMessage(
        error instanceof Error ? error.message : '저장 중 문제가 발생했어요.',
      );
      return false;
    }
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
        error instanceof Error ? error.message : '저장 중 문제가 발생했어요.',
      );
      return false;
    }
    if (!createdRoomId) return false;
    return confirmSchedule(createdRoomId);
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
    setScheduleModal(hasSavedSchedule ? 'confirmSchedule' : 'preSchedule');
  };

  const handleStartBasicInfo = (initialScreen: BasicInfoScreen) => {
    setScheduleModal('none');
    setBasicInfoInitialScreen(initialScreen);
    setIsBasicInfoOpen(true);
  };

  if (isBasicInfoOpen) {
    if (
      basicInfoInitialScreen === 'regularScheduleDetail' &&
      isRegularSchedulesLoading
    ) {
      return (
        <div className="flex w-full flex-1 items-center justify-center">
          <Spinner />
        </div>
      );
    }

    const savedItems = regularSchedulesData ?? [];

    return (
      <>
        <BasicInfo
          initialScreen={basicInfoInitialScreen}
          initialValue={
            basicInfoInitialScreen === 'regularScheduleDetail'
              ? {
                  ...DEFAULT_BASIC_INFO_VALUE,
                  hasRegularSchedule: savedItems.length > 0,
                  regularSchedules: savedItems.map(
                    mapRegularScheduleItemToClient,
                  ),
                  annualLeaveCount: savedItems[0]?.maxVacationDays ?? null,
                  leaveNoticeDays:
                    getLeaveNoticeDaysFromRegularSchedules(savedItems),
                  includeHalfDayHoliday:
                    getIncludeHalfDayHolidayFromRegularSchedules(savedItems),
                }
              : undefined
          }
          onExit={() => setIsBasicInfoOpen(false)}
          onRegularScheduleNext={handleSaveRegularSchedule}
          onBeforeIndividualSchedule={handleBeforeIndividualSchedule}
          onBeforeComplete={handleSaveIndividualSchedule}
          onComplete={() => {}}
          completeTitle="일정 입력하기"
          completeHeading={roomName}
          completeDescription="일정 입력이 완료되었어요!"
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
            initialTitleValue={`${roomName}에 초대할게!`}
            initialDescriptionValue="일정 입력하고 같이 여행 떠나자!"
            linkPath={`/room/${createdRoomId}`}
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
        onConfirm={() => handleStartBasicInfo('regularScheduleDetail')}
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
