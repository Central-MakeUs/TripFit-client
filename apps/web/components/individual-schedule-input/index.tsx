'use client';

import { ReactNode, useEffect, useState } from 'react';

import CtaButtonGroup from '@/components/cta-button-group';
import Header from '@/components/header';
import ProgressBar from '@/components/progress-bar';
import ScheduleCalendar from '@/components/schedule-calendar';
import { IndividualScheduleValueT } from '@/types/schedule';
import { cn } from '@/utils/cn';

export type TripChipOptionT = {
  id: number;
  title: string;
};

type IndividualScheduleInputProps = {
  title?: string;
  onBack: () => void;
  /** 위저드 안에 얹을 때 헤더 밑에 보여줄 진행률 — 미지정 시 프로그레스바 숨김 */
  progress?: number;
  /** 여행 선택 칩바 대신 보여줄 안내 문구 — tripOptions가 없을 때만 사용 */
  heading?: ReactNode;
  tripOptions?: TripChipOptionT[];
  selectedTripId?: number;
  onSelectTrip?: (id: number) => void;
  value: IndividualScheduleValueT;
  onChange: (value: IndividualScheduleValueT) => void;
  onNext: () => void;
};

function IndividualScheduleInput({
  title = '내 일정 입력하기',
  onBack,
  progress,
  heading,
  tripOptions,
  selectedTripId,
  onSelectTrip,
  value,
  onChange,
  onNext,
}: IndividualScheduleInputProps) {
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setToday(new Date());
  }, []);

  const hasTripChips = !!tripOptions?.length;

  return (
    <div className="flex w-full flex-1 flex-col">
      <Header variant="page" title={title} onBack={onBack} />
      {progress !== undefined && (
        <div className="px-5 py-1">
          <ProgressBar size="sm" value={progress} />
        </div>
      )}
      {hasTripChips && (
        <>
          <div className="fixed inset-x-0 top-11 z-20 mx-auto flex w-full gap-2 border-b border-grey-50 bg-white px-5 py-3 sm:max-w-90">
            {tripOptions!.map((trip) => {
              const selected = trip.id === selectedTripId;
              return (
                <button
                  key={trip.id}
                  type="button"
                  onClick={() => onSelectTrip?.(trip.id)}
                  className={cn(
                    'shrink-0 cursor-pointer rounded-full px-3 py-2 text-caption-01',
                    selected
                      ? 'bg-grey-800 text-white'
                      : 'bg-grey-50 text-grey-700',
                  )}
                >
                  {trip.title}
                </button>
              );
            })}
          </div>
          <div aria-hidden className="h-15 w-full shrink-0" />
        </>
      )}
      <div className="flex w-full flex-1 flex-col px-5 pt-3">
        {heading && !hasTripChips && (
          <h2 className="text-body-01 mb-13">{heading}</h2>
        )}
        {today && (
          <ScheduleCalendar
            year={today.getFullYear()}
            month={today.getMonth() + 1}
            value={value}
            onChange={onChange}
          />
        )}
        <div aria-hidden className="h-14.5 w-full shrink-0" />
        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full rounded-t-xl bg-white/80 backdrop-blur-[18px] sm:max-w-90">
          <CtaButtonGroup
            primaryText="다음"
            primaryColor="secondary"
            onPrimaryClick={onNext}
          />
        </div>
      </div>
    </div>
  );
}

export default IndividualScheduleInput;
