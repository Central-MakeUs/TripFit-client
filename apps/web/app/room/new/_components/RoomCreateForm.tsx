'use client';

import { useState } from 'react';
import { differenceInCalendarDays } from 'date-fns';
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

  const periodDays =
    tripPeriod.startDate && tripPeriod.endDate
      ? differenceInCalendarDays(tripPeriod.endDate, tripPeriod.startDate) + 1
      : null;

  const handleBack = () => {
    if (step === 1) {
      router.back();
      return;
    }
    setStep((prev) => prev - 1);
  };

  const isNextDisabled =
    step === 1
      ? !roomName
      : step === 2
        ? !tripPeriod.startDate || !tripPeriod.endDate
        : step === 3
          ? !isTripDurationValid(tripDuration, periodDays)
          : step === 4
            ? participantCount === 0
            : step === 5
              ? !destination
              : false;

  const handleNext = () => {
    // TODO: 5 → 6 전환 시 여행방 생성 API 호출 예정 (응답/요청 스키마 확정 후 연결)
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
          /* TODO: 참여자 초대하기 플로우 연결 */
        }}
        completeSecondaryText="나중에 할게요"
        onCompleteSecondaryClick={() => router.push('/')}
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
            primaryDisabled={isNextDisabled}
            secondaryText={
              step === 3 || step === 5 ? '아직 못정했어요' : undefined
            }
            secondaryVariant="text-link"
            secondaryIcon={false}
            onSecondaryClick={handleNext}
          />
        )}
      </div>
      <AlertModal
        open={scheduleModal === 'preSchedule'}
        onOpenChange={(open) => !open && setScheduleModal('none')}
        title="사전 일정 입력이 필요해요"
        description={
          <>
            여행방에 입장하려면
            <br />
            본인 일정을 먼저 입력해주세요.
          </>
        }
        primaryText="확인"
        primaryColor="primary"
        onPrimaryClick={() => handleStartBasicInfo('hasRegularSchedule')}
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
    </div>
  );
}

export default RoomCreateForm;
