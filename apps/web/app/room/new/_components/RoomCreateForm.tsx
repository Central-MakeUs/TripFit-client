'use client';

import { useState } from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import { useRouter } from 'next/navigation';

import AlertModal from '@/components/alert-modal';
import CtaButtonGroup from '@/components/cta-button-group';
import Header from '@/components/header';
import ProgressBar from '@/components/progress-bar';

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
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [isErrorAlertOpen, setIsErrorAlertOpen] = useState(false);

  const { postRoomMutation, isPostRoomPending } = usePostRoom();

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

  const handleCreateRoom = () => {
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
        destination: destination.trim() ? destination : null,
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
            onPrimaryClick={() => {
              // TODO: 참여자 초대하기 플로우 연결 예정 — 우선 방으로 바로 이동
              if (createdRoomId) router.push(`/room/${createdRoomId}`);
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
            primaryDisabled={isNextDisabled || isPostRoomPending}
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
