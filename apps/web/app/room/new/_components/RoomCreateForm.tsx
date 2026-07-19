'use client';

import { useState } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { useRouter } from 'next/navigation';

import CtaButtonGroup from '@/components/cta-button-group';
import Header from '@/components/header';
import ProgressBar from '@/components/progress-bar';

import CompleteStep from './steps/CompleteStep';
import DestinationStep from './steps/DestinationStep';
import ParticipantCountStep from './steps/ParticipantCountStep';
import PriorScheduleStep, {
  PriorScheduleValue,
} from './steps/PriorScheduleStep';
import RoomNameStep from './steps/RoomNameStep';
import TripDurationStep, {
  isTripDurationValid,
  TripDurationValue,
} from './steps/TripDurationStep';
import TripPeriodStep, { TripPeriodValue } from './steps/TripPeriodStep';

const TOTAL_STEPS = 7;

function RoomCreateForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
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
  const [priorSchedule, setPriorSchedule] = useState<PriorScheduleValue>({});

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
    // TODO: 6 → 7 전환 시 여행방 생성 API 호출 예정 (응답/요청 스키마 확정 후 연결)
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

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
          {step === 6 && (
            <PriorScheduleStep
              value={priorSchedule}
              onChange={setPriorSchedule}
            />
          )}
          {step === 7 && <CompleteStep roomName={roomName} />}
        </form>
        {step === 7 ? (
          <CtaButtonGroup
            primaryText="참여자 초대하기"
            primaryColor="secondary"
            onPrimaryClick={() => {
              /* TODO: 참여자 초대하기 플로우 연결 */
            }}
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
              step === 3 || step === 5 ? '아직 못 정했어요' : undefined
            }
            secondaryVariant="text-link"
            secondaryIcon={false}
            onSecondaryClick={handleNext}
          />
        )}
      </div>
    </div>
  );
}

export default RoomCreateForm;
