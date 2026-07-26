'use client';

import { useState } from 'react';

import ArrowRightIcon from '@/assets/icons/arrow-right-300.svg';
import BasicInfo from '@/components/basic-info';
import { DEFAULT_BASIC_INFO_VALUE } from '@/components/basic-info/basicInfo.const';
import Header from '@/components/header';
import IndividualScheduleInput from '@/components/individual-schedule-input';
import { IndividualScheduleValueT, RegularScheduleT } from '@/types/schedule';
import { cn } from '@/utils/cn';

// TODO: 참여 중인 여행 목록 조회 API 연동 전까지 임시로 고정
const MOCK_TRIP_OPTIONS = [
  { id: 1, title: '제주도 여행' },
  { id: 2, title: '나트랑 여행' },
  { id: 3, title: '전주 여행' },
];

// TODO: 근무 일정 저장 여부 조회 API 연동 후 실제 저장된 값으로 대체
const MOCK_SAVED_REGULAR_SCHEDULES: RegularScheduleT[] = [
  { id: 'mock-1', days: [1, 2, 3], startTime: '09:30', endTime: '18:00' },
];

const MENU_ITEMS = [
  {
    key: 'calendar',
    title: '캘린더 연동하기',
    description: '구글 캘린더를 연동해 편하게 여행 일정을 관리하세요',
  },
  {
    key: 'schedule',
    title: '내 일정 입력하기',
    description: '내 일정을 업데이트하고 추천 여행 일정을 받아보세요',
  },
  {
    key: 'basicInfo',
    title: '기본 정보 관리',
    description: '정기 일정과 연차 조건을 설정할 수 있어요',
  },
] as const;

function MyScheduleSection() {
  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(false);
  const [isCalendarConnectOpen, setIsCalendarConnectOpen] = useState(false);
  const [isIndividualScheduleOpen, setIsIndividualScheduleOpen] =
    useState(false);
  const [individualScheduleValue, setIndividualScheduleValue] =
    useState<IndividualScheduleValueT>({});
  const [selectedTripId, setSelectedTripId] = useState(1);

  if (isCalendarConnectOpen) {
    return (
      <BasicInfo
        initialScreen="calendarConnectIntro"
        onExit={() => setIsCalendarConnectOpen(false)}
        onComplete={() => setIsCalendarConnectOpen(false)}
      />
    );
  }

  if (isIndividualScheduleOpen) {
    return (
      <IndividualScheduleInput
        tripOptions={MOCK_TRIP_OPTIONS}
        selectedTripId={selectedTripId}
        onSelectTrip={setSelectedTripId}
        value={individualScheduleValue}
        onChange={setIndividualScheduleValue}
        onBack={() => setIsIndividualScheduleOpen(false)}
        onNext={() => {
          // TODO: 개별 일정 저장 API 연동
          setIsIndividualScheduleOpen(false);
        }}
      />
    );
  }

  if (isBasicInfoOpen) {
    return (
      <BasicInfo
        allowSkip={false}
        title="기본 정보 관리"
        initialScreen="regularScheduleDetail"
        initialValue={{
          ...DEFAULT_BASIC_INFO_VALUE,
          hasRegularSchedule: true,
          regularSchedules: MOCK_SAVED_REGULAR_SCHEDULES,
        }}
        endsAtIncludeHalfDayHoliday
        onExit={() => setIsBasicInfoOpen(false)}
        onComplete={() => {
          // TODO: 기본 정보(정기 일정/연차 조건) 저장 API 연동
          setIsBasicInfoOpen(false);
        }}
      />
    );
  }

  const handleClickItem = (key: (typeof MENU_ITEMS)[number]['key']) => {
    if (key === 'basicInfo') {
      setIsBasicInfoOpen(true);
      return;
    }
    if (key === 'calendar') {
      setIsCalendarConnectOpen(true);
      return;
    }
    if (key === 'schedule') {
      setIsIndividualScheduleOpen(true);
      return;
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col bg-grey-20">
      <Header variant="page" title="내 일정 관리" background="grey-20" />
      <div className="flex w-full flex-1 flex-col px-5 py-3">
        <ul className="flex w-full flex-col overflow-hidden rounded-2xl">
          {MENU_ITEMS.map((item, index) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => handleClickItem(item.key)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-1 bg-white p-4',
                  index < MENU_ITEMS.length - 1 && 'border-b border-grey-50',
                )}
              >
                <div className="flex flex-1 flex-col items-start gap-0.5 text-left">
                  <span className="text-body-05 text-black">{item.title}</span>
                  <span className="text-caption-03 text-grey-500">
                    {item.description}
                  </span>
                </div>
                <ArrowRightIcon className="size-4 shrink-0 text-grey-300" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default MyScheduleSection;
