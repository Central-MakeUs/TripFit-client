'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Header from '@/components/header';
import ProgressBar from '@/components/progress-bar';

import RoomNameStep from './RoomNameStep';
import TripDurationStep, { TripDurationValue } from './TripDurationStep';
import TripPeriodStep, { TripPeriodValue } from './TripPeriodStep';

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
        <form className="flex w-full flex-col">
          {step === 1 && (
            <RoomNameStep value={roomName} onChange={setRoomName} />
          )}
          {step === 2 && (
            <TripPeriodStep value={tripPeriod} onChange={setTripPeriod} />
          )}
          {step === 3 && (
            <TripDurationStep value={tripDuration} onChange={setTripDuration} />
          )}
          {/* 인원 */}
          {/* 여행지 */}
          {/* 선약 일정 선택 */}
          {/* 완료 */}
        </form>
        <div className="mt-auto w-full pt-2 pb-0.5">
          {/* 임시 다음 버튼 */}
          <button
            type="button"
            disabled={isNextDisabled}
            onClick={handleNext}
            className="w-full cursor-pointer rounded-xl px-4 py-2.5 bg-grey-800 text-center text-white disabled:cursor-not-allowed disabled:bg-grey-100 disabled:text-white"
          >
            다음
          </button>
          {step === 3 && (
            <button
              type="button"
              onClick={handleNext}
              className="text-body-05 text-grey-500 mx-auto block w-fit cursor-pointer mt-2 p-2 text-center"
            >
              아직 못 정했어요
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomCreateForm;
