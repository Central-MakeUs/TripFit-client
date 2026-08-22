'use client';

import { ReactNode, useEffect, useState } from 'react';

import CloseIcon from '@/assets/icons/close.svg';
import CtaButtonGroup from '@/components/cta-button-group';
import Header from '@/components/header';
import IconButton from '@/components/icon-button';
import ProgressBar from '@/components/progress-bar';
import ScheduleCalendar from '@/components/schedule-calendar';
import { IndividualScheduleValueT } from '@/types/schedule';
import { cn } from '@/utils/cn';

export type TripChipOptionT = {
  id: string;
  title: string;
};

type IndividualScheduleInputProps = {
  title?: string;
  onBack: () => void;
  /** 지정하면 헤더 오른쪽에 전체 닫기(X) 버튼을 보여줌 — 자유롭게 나갈 수 있는
   * 임의 편집 플로우에서만 쓴다 */
  onClose?: () => void;
  /** 위저드 안에 얹을 때 헤더 밑에 보여줄 진행률 — 미지정 시 프로그레스바 숨김 */
  progress?: number;
  /** 여행 선택 칩바 대신 보여줄 안내 문구 — tripOptions가 없을 때만 사용 */
  heading?: ReactNode;
  /** heading 아래에 보여줄 보조 설명 — tripOptions가 없을 때만 사용 */
  description?: ReactNode;
  tripOptions?: TripChipOptionT[];
  selectedTripId?: string;
  onSelectTrip?: (id: string) => void;
  /** 캘린더가 스크롤을 시작할 연/월 — 미지정 시 오늘 기준 */
  initialYear?: number;
  initialMonth?: number;
  value: IndividualScheduleValueT;
  onChange: (value: IndividualScheduleValueT) => void;
  /** 정기 일정 등을 합쳐 계산된 읽기 전용 배경값 — ScheduleCalendar에 그대로 전달 */
  mergedStatus?: IndividualScheduleValueT;
  /** 지정하면 이 날짜 이전은 선택할 수 없게 비활성화됨 — ScheduleCalendar에 그대로 전달 */
  minDate?: Date;
  /** 지정하면 이 날짜 이후는 선택할 수 없게 비활성화됨 — ScheduleCalendar에 그대로 전달 */
  maxDate?: Date;
  /** 지정하면 initialYear/initialMonth(달력 시작 기준)는 그대로 둔 채 이 연/월로
   * 스크롤만 이동한다 — ScheduleCalendar에 그대로 전달 */
  scrollToYear?: number;
  scrollToMonth?: number;
  onNext: () => void;
};

function IndividualScheduleInput({
  title = '내 일정 입력하기',
  onBack,
  onClose,
  progress,
  heading,
  description,
  tripOptions,
  selectedTripId,
  onSelectTrip,
  initialYear,
  initialMonth,
  value,
  onChange,
  mergedStatus,
  minDate,
  maxDate,
  scrollToYear,
  scrollToMonth,
  onNext,
}: IndividualScheduleInputProps) {
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setToday(new Date());
  }, []);

  const hasTripChips = !!tripOptions?.length;

  return (
    <div className="flex w-full flex-1 flex-col">
      <Header
        variant="page"
        title={title}
        onBack={onBack}
        rightSlot={
          onClose && (
            <IconButton
              onClick={onClose}
              aria-label="닫기"
              icon={<CloseIcon className="text-grey-500" />}
            />
          )
        }
      />
      {progress !== undefined && (
        <div className="px-5 py-1">
          <ProgressBar size="sm" value={progress} />
        </div>
      )}
      {hasTripChips && (
        <>
          <div className="no-scrollbar fixed inset-x-0 top-11 z-20 mx-auto flex w-full gap-2 overflow-x-auto border-b border-grey-50 bg-white px-5 py-3 sm:max-w-90">
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
        {(heading || description) && !hasTripChips && (
          <div className="mb-13 flex flex-col gap-0.5">
            {heading && <h2 className="text-body-01">{heading}</h2>}
            {description && (
              <p className="text-caption-01 text-grey-400">{description}</p>
            )}
          </div>
        )}
        {today && (
          <ScheduleCalendar
            year={initialYear ?? today.getFullYear()}
            month={initialMonth ?? today.getMonth() + 1}
            value={value}
            onChange={onChange}
            mergedStatus={mergedStatus}
            minDate={minDate}
            maxDate={maxDate}
            scrollToYear={scrollToYear}
            scrollToMonth={scrollToMonth}
            scrollMarginClassName={hasTripChips ? 'scroll-mt-27' : undefined}
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
