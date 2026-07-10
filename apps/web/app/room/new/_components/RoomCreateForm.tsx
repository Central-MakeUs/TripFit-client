'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Header from '@/components/header';
import ProgressBar from '@/components/progress-bar';

import StepActions from './StepActions';
import CompleteStep from './steps/CompleteStep';
import DestinationStep from './steps/DestinationStep';
import ParticipantCountStep from './steps/ParticipantCountStep';
import PriorScheduleStep, {
  PriorScheduleValue,
} from './steps/PriorScheduleStep';
import RoomNameStep from './steps/RoomNameStep';
import TripDurationStep, { TripDurationValue } from './steps/TripDurationStep';
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
          ? !tripDuration.nights || !tripDuration.days
          : step === 4
            ? participantCount === 0
            : step === 5
              ? !destination
              : false;

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  return (
    <div className="flex w-full flex-1 flex-col">
      <Header variant="page" title="여행방 추가하기" onBack={handleBack} />
      <div className="flex w-full flex-1 flex-col px-5">
        <div className="py-1">
          <ProgressBar size="sm" value={(step / TOTAL_STEPS) * 100} />
        </div>
        <form className="flex w-full flex-1 flex-col">
          {step === 1 && (
            <RoomNameStep value={roomName} onChange={setRoomName} />
          )}
          {step === 2 && (
            <TripPeriodStep value={tripPeriod} onChange={setTripPeriod} />
          )}
          {step === 3 && (
            <TripDurationStep value={tripDuration} onChange={setTripDuration} />
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
          {step === 7 && <CompleteStep destination={destination} />}
        </form>
        {step === 7 ? (
          <StepActions
            primaryLabel="참여자 초대하기"
            onPrimaryClick={() => {
              /* TODO: 참여자 초대하기 플로우 연결 */
            }}
            secondaryLabel="나중에 할게요"
            onSecondaryClick={() => router.push('/')}
          />
        ) : (
          <StepActions
            primaryLabel="다음"
            onPrimaryClick={handleNext}
            primaryDisabled={isNextDisabled}
            secondaryLabel={
              step === 3 || step === 5 ? '아직 못 정했어요' : undefined
            }
            onSecondaryClick={handleNext}
          />
        )}
      </div>
    </div>
  );
}

export default RoomCreateForm;
