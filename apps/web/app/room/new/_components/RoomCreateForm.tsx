'use client';

import { useState } from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import { useRouter } from 'next/navigation';

import CalendarMonthIcon from '@/assets/icons/calendar-month.svg';
import AlertModal from '@/components/alert-modal';
import BasicInfo from '@/components/basic-info';
import {
  BasicInfoScreen,
  DEFAULT_BASIC_INFO_VALUE,
} from '@/components/basic-info/basicInfo.const';
import CtaButtonGroup from '@/components/cta-button-group';
import Header from '@/components/header';
import ProgressBar from '@/components/progress-bar';
import { RegularScheduleT } from '@/types/schedule';

import PreScheduleRequiredModal from '../../_common/_components/PreScheduleRequiredModal';
import { usePostRoom } from '../_hooks/usePostRoom';
import CompleteStep from './steps/CompleteStep';
import DestinationStep from './steps/DestinationStep';
import ParticipantCountStep from './steps/ParticipantCountStep';
import RoomNameStep from './steps/RoomNameStep';
import TripDurationStep, {
  isTripDurationValid,
  TripDurationValue,
} from './steps/TripDurationStep';
import TripPeriodStep, { TripPeriodValue } from './steps/TripPeriodStep';

const TOTAL_STEPS = 6;

// TODO: 근무 일정 저장 여부 조회 API 연동 전까지 임시로 고정
const HAS_SAVED_SCHEDULE = true;

// TODO: 근무 일정 저장 여부 조회 API 연동 후 실제 저장된 값으로 대체
const MOCK_SAVED_REGULAR_SCHEDULES: RegularScheduleT[] = [
  { id: 'mock-1', days: [1, 2, 3], startTime: '09:30', endTime: '18:00' },
];

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
  const [isErrorAlertOpen, setIsErrorAlertOpen] = useState(false);

  const { postRoomMutation, isPostRoomPending } = usePostRoom();

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
    setScheduleModal(HAS_SAVED_SCHEDULE ? 'confirmSchedule' : 'preSchedule');
  };

  const handleStartBasicInfo = (initialScreen: BasicInfoScreen) => {
    setScheduleModal('none');
    setBasicInfoInitialScreen(initialScreen);
    setIsBasicInfoOpen(true);
  };

  if (isBasicInfoOpen) {
    return (
      <BasicInfo
        initialScreen={basicInfoInitialScreen}
        initialValue={
          basicInfoInitialScreen === 'regularScheduleDetail'
            ? {
                ...DEFAULT_BASIC_INFO_VALUE,
                hasRegularSchedule: true,
                regularSchedules: MOCK_SAVED_REGULAR_SCHEDULES,
              }
            : undefined
        }
        onExit={() => setIsBasicInfoOpen(false)}
        onComplete={() => {
          // TODO: 근무 일정 저장 API 연동
          setIsBasicInfoOpen(false);
        }}
        completeTitle="일정 입력하기"
        completeHeading={roomName}
        completeDescription="일정 입력이 완료되었어요!"
        completePrimaryText="참여자 초대하기"
        onCompletePrimaryClick={() => {
          // TODO: 참여자 초대하기 플로우 연결 예정 — 우선 방으로 바로 이동
          if (createdRoomId) router.push(`/room/${createdRoomId}`);
        }}
        completeSecondaryText="나중에 할게요"
        onCompleteSecondaryClick={() => {
          if (createdRoomId) router.push(`/room/${createdRoomId}`);
        }}
      />
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
      <AlertModal
        open={scheduleModal === 'confirmSchedule'}
        onOpenChange={(open) => !open && setScheduleModal('none')}
        icon={<CalendarMonthIcon className="h-6 w-auto" />}
        title="입력하신 일정을 확인해주세요"
        description={
          <>
            이전에 입력한 일정에
            <br />
            변경 사항이 있다면 수정해주세요.
          </>
        }
        secondaryText="변경된게 없어요"
        onSecondaryClick={() => handleStartBasicInfo('regularScheduleDetail')}
        primaryText="수정하기"
        primaryColor="primary"
        onPrimaryClick={() => handleStartBasicInfo('regularScheduleDetail')}
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
