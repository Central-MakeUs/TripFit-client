'use client';

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';

import AlertModal from '@/components/alert-modal';
import CheckCompleteStep from '@/components/check-complete-step';
import Header from '@/components/header';
import IndividualScheduleInput from '@/components/individual-schedule-input';
import ProgressBar from '@/components/progress-bar';

import {
  BASIC_INFO_PROGRESS_STEPS,
  BasicInfoScreen,
  BasicInfoValue,
  DEFAULT_BASIC_INFO_VALUE,
} from './basicInfo.const';
import AnnualLeaveCountStep from './steps/AnnualLeaveCountStep';
import CalendarConnectIntroStep from './steps/CalendarConnectIntroStep';
import HasRegularScheduleStep from './steps/HasRegularScheduleStep';
import IncludeHalfDayHolidayStep from './steps/IncludeHalfDayHolidayStep';
import LeaveNoticeDaysStep from './steps/LeaveNoticeDaysStep';
import RegularScheduleDetailStep from './steps/RegularScheduleDetailStep';

type BasicInfoProps = {
  initialValue?: BasicInfoValue;
  initialScreen?: BasicInfoScreen;
  /** 완료 화면 기본/보조 버튼 클릭 시 호출됨 — 저장은 이미 끝난 뒤라, 여기선 오버레이 닫기 등 화면 전환용 동작만 처리 */
  onComplete: (value: BasicInfoValue) => void;
  /** 반차/공휴일 포함 여부 스텝(정기 일정 섹션의 마지막 스텝) "다음"에서, 다음 화면(개별 일정 또는 완료 화면)으로 넘어가기 전에 호출되고 완료될 때까지 대기함 — 정기 일정 저장에 사용. false를 반환하면 다음 화면으로 넘어가지 않고 현재 화면에 머무름 (반환값 없으면 true로 간주) */
  onRegularScheduleNext?: (
    value: BasicInfoValue,
  ) => boolean | void | Promise<boolean | void>;
  /** 개별 일정 입력 마지막 "다음"에서, 완료 화면으로 넘어가기 전에 호출되고 완료될 때까지 대기함 — 개별 일정 저장, 여행방 confirm처럼 완료 화면 도달 전에 처리해야 하는 동작에 사용. false를 반환하면 완료 화면으로 넘어가지 않음 (반환값 없으면 true로 간주) */
  onBeforeComplete?: (
    value: BasicInfoValue,
  ) => boolean | void | Promise<boolean | void>;
  allowSkip?: boolean;
  onExit?: () => void;
  /** 위저드 메인 화면의 헤더 타이틀 — 미지정 시 "일정 입력하기" */
  title?: string;
  /** 캘린더 연동 스텝의 헤더 타이틀 — 미지정 시 "캘린더 연동하기" */
  calendarConnectTitle?: string;
  /** 캘린더 연동 스텝의 프로그레스바 값 — 미지정 시 프로그레스바 숨김 */
  calendarConnectProgress?: number;
  /** true면 캘린더 연동/건너뛰기 모두 완료 화면 없이 바로 정기 일정 스텝으로 이어짐 (회원가입처럼 더 큰 플로우에 얹을 때 사용) */
  calendarConnectContinuesToSchedule?: boolean;
  /** true면 반차/공휴일 포함 여부 스텝이 마지막 스텝이 되어 개별 일정 입력 없이 바로 완료됨 (내 일정 관리처럼 개별 일정을 별도 메뉴로 다루는 플로우에 사용) */
  endsAtIncludeHalfDayHoliday?: boolean;
  /** 완료 화면의 헤더 타이틀 — 미지정 시 "기본 정보 입력" */
  completeTitle?: string;
  /** 완료 화면 헤딩 — 미지정 시 "기본 정보 등록이 완료되었습니다!" */
  completeHeading?: ReactNode;
  /** 완료 화면 설명 — 미지정 시 표시 안 함 */
  completeDescription?: ReactNode;
  /** 완료 화면 기본 버튼 텍스트 — 미지정 시 "시작하기" */
  completePrimaryText?: string;
  /** 완료 화면 기본 버튼 클릭 시 onComplete와 함께 호출할 추가 동작 */
  onCompletePrimaryClick?: () => void;
  /** 완료 화면 보조 버튼 텍스트 — 지정할 때만 보조 버튼이 표시됨 */
  completeSecondaryText?: string;
  /** 완료 화면 보조 버튼 클릭 시 onComplete와 함께 호출할 추가 동작 */
  onCompleteSecondaryClick?: () => void;
};

function BasicInfo({
  initialValue = DEFAULT_BASIC_INFO_VALUE,
  initialScreen = 'hasRegularSchedule',
  onComplete,
  onRegularScheduleNext,
  onBeforeComplete,
  allowSkip = true,
  onExit,
  title = '일정 입력하기',
  calendarConnectTitle,
  calendarConnectProgress,
  calendarConnectContinuesToSchedule = false,
  endsAtIncludeHalfDayHoliday = false,
  completeTitle,
  completeHeading,
  completeDescription,
  completePrimaryText,
  onCompletePrimaryClick,
  completeSecondaryText,
  onCompleteSecondaryClick,
}: BasicInfoProps) {
  const router = useRouter();
  const [screenHistory, setScreenHistory] = useState<BasicInfoScreen[]>([
    initialScreen,
  ]);
  const [value, setValue] = useState<BasicInfoValue>(initialValue);
  const [isNoScheduleConfirmOpen, setIsNoScheduleConfirmOpen] = useState(false);

  const screen =
    screenHistory[screenHistory.length - 1] ?? 'hasRegularSchedule';

  const currentStepIndex = BASIC_INFO_PROGRESS_STEPS.findIndex((group) =>
    group.includes(screen),
  );
  const progress =
    ((currentStepIndex + 1) / BASIC_INFO_PROGRESS_STEPS.length) * 100;

  const navigateTo = (nextScreen: BasicInfoScreen) => {
    setScreenHistory((prev) => [...prev, nextScreen]);
  };

  const handleBack = () => {
    if (screenHistory.length === 1) {
      if (onExit) {
        onExit();
        return;
      }
      router.back();
      return;
    }
    setScreenHistory((prev) => prev.slice(0, -1));
  };

  const handleHasRegularScheduleNext = (hasRegularSchedule: boolean) => {
    setValue((prev) => ({
      ...prev,
      hasRegularSchedule,
      regularSchedules: hasRegularSchedule ? prev.regularSchedules : [],
    }));
    if (hasRegularSchedule) {
      navigateTo('regularScheduleDetail');
      return;
    }
    setIsNoScheduleConfirmOpen(true);
  };

  const handleConfirmNoSchedule = () => {
    setIsNoScheduleConfirmOpen(false);
    navigateTo('individualSchedule');
  };

  const handleSkip = () => {
    router.push('/');
  };

  const handleRegularScheduleDetailNext = () => {
    navigateTo('annualLeaveCount');
  };

  const handleAnnualLeaveCountNext = () => {
    navigateTo('leaveNoticeDays');
  };

  const handleLeaveNoticeDaysNext = () => {
    navigateTo('includeHalfDayHoliday');
  };

  const handleIncludeHalfDayHolidayNext = async () => {
    const canProceed = (await onRegularScheduleNext?.(value)) ?? true;
    if (!canProceed) return;
    navigateTo(endsAtIncludeHalfDayHoliday ? 'complete' : 'individualSchedule');
  };

  const handleIndividualScheduleNext = async () => {
    const canProceed = (await onBeforeComplete?.(value)) ?? true;
    if (!canProceed) return;
    navigateTo('complete');
  };

  const handleCompletePrimaryClick = () => {
    onComplete(value);
    onCompletePrimaryClick?.();
  };

  const handleCompleteSecondaryClick = () => {
    onComplete(value);
    onCompleteSecondaryClick?.();
  };

  if (screen === 'calendarConnectIntro') {
    return (
      <CalendarConnectIntroStep
        title={calendarConnectTitle}
        progress={calendarConnectProgress}
        onBack={handleBack}
        onConnect={() =>
          navigateTo(
            calendarConnectContinuesToSchedule
              ? 'hasRegularSchedule'
              : 'calendarConnectComplete',
          )
        }
        onSkip={
          calendarConnectContinuesToSchedule
            ? () => navigateTo('hasRegularSchedule')
            : handleBack
        }
      />
    );
  }

  if (screen === 'calendarConnectComplete') {
    return (
      <CheckCompleteStep
        heading="구글 캘린더 연동 완료!"
        description={
          <>
            입력되어 있는 일정을
            <br />
            캘린더에 추가했어요
          </>
        }
        primaryText="확인"
        primaryColor="primary"
        onPrimaryClick={() => (onExit ? onExit() : onComplete(value))}
      />
    );
  }

  if (screen === 'individualSchedule') {
    return (
      <IndividualScheduleInput
        title={title}
        onBack={handleBack}
        progress={progress}
        heading="날짜를 클릭해 스케줄을 입력해주세요"
        value={value.individualSchedule}
        onChange={(individualSchedule) =>
          setValue((prev) => ({ ...prev, individualSchedule }))
        }
        onNext={handleIndividualScheduleNext}
      />
    );
  }

  if (screen === 'complete') {
    return (
      <CheckCompleteStep
        title={completeTitle}
        heading={
          completeHeading ?? (
            <>
              기본 정보 등록이
              <br />
              완료되었습니다!
            </>
          )
        }
        description={completeDescription}
        primaryText={completePrimaryText}
        onPrimaryClick={handleCompletePrimaryClick}
        secondaryText={completeSecondaryText}
        onSecondaryClick={
          completeSecondaryText ? handleCompleteSecondaryClick : undefined
        }
        showHeader
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col">
      <Header variant="page" title={title} onBack={handleBack} />
      <div className="px-5 py-1">
        <ProgressBar size="sm" value={progress} />
      </div>
      <div className="flex w-full flex-1 flex-col px-5">
        {screen === 'hasRegularSchedule' && (
          <HasRegularScheduleStep
            value={value.hasRegularSchedule}
            onNext={handleHasRegularScheduleNext}
            onSkip={allowSkip ? handleSkip : undefined}
          />
        )}
        {screen === 'regularScheduleDetail' && (
          <RegularScheduleDetailStep
            value={value.regularSchedules}
            onChange={(regularSchedules) =>
              setValue((prev) => ({ ...prev, regularSchedules }))
            }
            onNext={handleRegularScheduleDetailNext}
            onSkip={allowSkip ? handleSkip : undefined}
          />
        )}
        {screen === 'annualLeaveCount' && (
          <AnnualLeaveCountStep
            value={value.annualLeaveCount}
            onChange={(annualLeaveCount) =>
              setValue((prev) => ({ ...prev, annualLeaveCount }))
            }
            onNext={handleAnnualLeaveCountNext}
            onSkip={allowSkip ? handleSkip : undefined}
          />
        )}
        {screen === 'leaveNoticeDays' && (
          <LeaveNoticeDaysStep
            value={value.leaveNoticeDays}
            onChange={(leaveNoticeDays) =>
              setValue((prev) => ({ ...prev, leaveNoticeDays }))
            }
            onNext={handleLeaveNoticeDaysNext}
            onSkip={allowSkip ? handleSkip : undefined}
          />
        )}
        {screen === 'includeHalfDayHoliday' && (
          <IncludeHalfDayHolidayStep
            value={value.includeHalfDayHoliday}
            onChange={(includeHalfDayHoliday) =>
              setValue((prev) => ({ ...prev, includeHalfDayHoliday }))
            }
            onNext={handleIncludeHalfDayHolidayNext}
            onSkip={
              allowSkip
                ? endsAtIncludeHalfDayHoliday
                  ? handleIncludeHalfDayHolidayNext
                  : handleSkip
                : undefined
            }
            primaryText={endsAtIncludeHalfDayHoliday ? '등록 완료하기' : '다음'}
          />
        )}
      </div>
      <AlertModal
        open={isNoScheduleConfirmOpen}
        onOpenChange={setIsNoScheduleConfirmOpen}
        icon={null}
        title={
          <>
            여행이 어려운 날짜를
            <br />
            직접 입력하시겠어요?
          </>
        }
        description="입력한 날짜는 제외하고 추천할게요"
        secondaryText="건너뛰기"
        onSecondaryClick={handleConfirmNoSchedule}
        primaryText="직접 입력"
        primaryColor="primary"
        onPrimaryClick={handleConfirmNoSchedule}
      />
    </div>
  );
}

export default BasicInfo;
