'use client';

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';

import CloseIcon from '@/assets/icons/close.svg';
import CheckCompleteStep from '@/components/check-complete-step';
import Header from '@/components/header';
import IconButton from '@/components/icon-button';
import IndividualScheduleInput from '@/components/individual-schedule-input';
import ProgressBar from '@/components/progress-bar';
import { IndividualScheduleValueT, RegularScheduleT } from '@/types/schedule';

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
import ScheduleChangedStep from './steps/ScheduleChangedStep';

type BasicInfoProps = {
  initialValue?: BasicInfoValue;
  initialScreen?: BasicInfoScreen;
  /** 완료 화면 기본/보조 버튼 클릭 시 호출됨 — 저장은 이미 끝난 뒤라, 여기선 오버레이 닫기 등 화면 전환용 동작만 처리 */
  onComplete: (value: BasicInfoValue) => void;
  /** 반차/공휴일 포함 여부 스텝(정기 일정 섹션의 마지막 스텝) "다음"에서, 다음 화면(개별 일정 또는 완료 화면)으로 넘어가기 전에 호출되고 완료될 때까지 대기함 — 연차·반차·공휴일 정책 저장에 사용(정기 일정 자체는 항목을 추가·수정·삭제하는 즉시 아래 onAddRegularSchedule 등으로 이미 저장되어 있다). false를 반환하면 다음 화면으로 넘어가지 않고 현재 화면에 머무름 (반환값 없으면 true로 간주) */
  onVacationPolicyNext?: (
    value: BasicInfoValue,
  ) => boolean | void | Promise<boolean | void>;
  /** 정기 일정 목록 화면에서 "추가하기"를 누른 그 즉시 호출됨 — 실제 저장에 성공하면
   * 서버가 내려준(id가 붙은) 항목을 반환해야 화면 목록에 반영된다. regularScheduleDetail
   * 화면으로 진입시키는 모든 곳에서 필수로 넘겨야 한다(캘린더 연동 전용처럼 그 화면
   * 자체를 안 쓰는 곳만 생략 가능하도록 옵셔널로 둠) */
  onAddRegularSchedule?: (
    schedule: Omit<RegularScheduleT, 'id'>,
  ) => Promise<RegularScheduleT>;
  /** 정기 일정 항목을 수정한 그 즉시 호출됨 */
  onEditRegularSchedule?: (
    schedule: RegularScheduleT,
  ) => Promise<RegularScheduleT>;
  /** 정기 일정 항목을 삭제한 그 즉시 호출됨 */
  onRemoveRegularSchedule?: (id: string) => Promise<void>;
  /** 정기 일정 추가·수정·삭제 중 하나라도 실패하면 호출됨 — 부모가 공통 에러 안내(AlertModal)를 띄운다 */
  onRegularScheduleError?: (message: string) => void;
  /** "정기 일정이 있나요?"에서 "아니요"를 고른 즉시 호출됨 — 본인 정기 일정 전체
   * 삭제. regularScheduleDetail 화면으로 진입시키는 모든 곳(hasRegularSchedule 화면을
   * 실제로 띄우는 곳)은 필수로 넘겨야 한다 */
  onDeleteAllRegularSchedules?: () => Promise<void>;
  /** 개별 일정 화면 진입 직전(정기 일정 없음 확정 시 또는 반차/공휴일 스텝 다음)에 호출됨 — 반환값이 있으면 개별 일정 초기값을 그 값으로 교체함(예: 방금 저장된 정기 일정을 반영한 병합 캘린더로 갱신) */
  onBeforeIndividualSchedule?: () =>
    | Promise<IndividualScheduleValueT | void>
    | IndividualScheduleValueT
    | void;
  /** 개별 일정 입력 마지막 "다음"에서, 완료 화면으로 넘어가기 전에 호출되고 완료될 때까지 대기함 — 개별 일정 저장, 여행방 confirm처럼 완료 화면 도달 전에 처리해야 하는 동작에 사용. false를 반환하면 완료 화면으로 넘어가지 않음 (반환값 없으면 true로 간주). 두 번째 인자는 개별 일정 화면의 배경값(정기 일정 등을 합친 병합 캘린더)으로, 슬롯이 이 값과 같은 날짜인지 판단해 uncertain만 보낼지 결정하는 데 사용 */
  onBeforeComplete?: (
    value: BasicInfoValue,
    individualScheduleBackdrop: IndividualScheduleValueT,
  ) => boolean | void | Promise<boolean | void>;
  allowSkip?: boolean;
  /** "건너뛰기" 시 이동할 경로 — 미지정 시 홈("/"). 초대 링크로 들어온 회원가입처럼
   * 완료 후 원래 가려던 곳으로 이어져야 하는 플로우에서 사용 */
  skipPath?: string;
  onExit?: () => void;
  /** 지정하면 위저드 전 화면(완료 화면 포함) 헤더 오른쪽에 전체 닫기(X) 버튼을
   * 보여줌 — 자유롭게 나갈 수 있는 임의 편집 플로우에서만 쓰고, 반드시 완료해야
   * 하는 필수 입력 플로우(allowSkip={false}인 최초 일정 입력 등)에는 넘기지 않는다 */
  onClose?: () => void;
  /** 위저드 메인 화면의 헤더 타이틀 — 미지정 시 "일정 입력하기" */
  title?: string;
  /** 개별 일정 입력 화면의 안내 문구 — 미지정 시 "날짜를 클릭해 스케줄을 입력해주세요"
   * (여행방 생성/입장 전 일정 입력용). 회원가입처럼 다른 문구가 필요한 곳에서만 넘긴다 */
  individualScheduleHeading?: ReactNode;
  /** 개별 일정 입력 화면의 보조 설명 — 미지정 시 표시 안 함 */
  individualScheduleDescription?: ReactNode;
  /** 개별 일정 입력 화면의 캘린더를 이 날짜 이전은 선택 못 하게 제한 — 지정하면
   * 캘린더도 이 날짜가 속한 달부터 보여줌(여행방 입장처럼 특정 여행 기간으로
   * 좁혀야 하는 플로우에서 사용). 미지정 시 기존처럼 오늘부터 제한 없이 열림 */
  individualScheduleMinDate?: Date;
  /** 개별 일정 입력 화면의 캘린더를 이 날짜 이후는 선택 못 하게 제한 — 미지정 시
   * 기존처럼 오늘+2년까지 제한 없이 열림 */
  individualScheduleMaxDate?: Date;
  /** 캘린더 연동 스텝의 헤더 타이틀 — 미지정 시 "캘린더 연동하기" */
  calendarConnectTitle?: string;
  /** 캘린더 연동 스텝의 프로그레스바 값 — 미지정 시 프로그레스바 숨김 */
  calendarConnectProgress?: number;
  /** true면 캘린더 연동/건너뛰기 모두 완료 화면 없이 바로 정기 일정 스텝으로 이어짐 (회원가입처럼 더 큰 플로우에 얹을 때 사용) */
  calendarConnectContinuesToSchedule?: boolean;
  /** "구글 캘린더 연동하기" 클릭 시 호출됨 — 연동 성공 시 true를 반환해야 완료 화면으로
   * 넘어간다. 웹 브라우저 리다이렉트 방식은 페이지 전체가 떠나버려(실제 구글 OAuth
   * 동의 화면으로 이동) 이 Promise가 resolve되지 않고, 완료 화면 표시는 부모가 리다이렉트
   * 완료 후 initialScreen으로 복원해서 처리한다. 앱(WebView)은 네이티브 SDK로 그 자리에서
   * 바로 연동이 끝나므로 반환값으로 곧장 완료 화면으로 넘어간다. 에러 처리(알럿 표시 등)는
   * 부모가 내부적으로 하고 항상 boolean만 반환해야 한다(throw 금지) */
  onConnectGoogleCalendar?: () => boolean | Promise<boolean>;
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
  /** true면 완료 화면에 컨페티 연출을 함께 보여줌 — 지정된 완료 화면(여행방 생성 완료,
   * 회원가입 기본정보 완료)에서만 켠다. calendarConnectComplete 화면엔 영향 없음 */
  completeShowConfetti?: boolean;
};

function BasicInfo({
  initialValue = DEFAULT_BASIC_INFO_VALUE,
  initialScreen = 'hasRegularSchedule',
  onComplete,
  onVacationPolicyNext,
  // regularScheduleDetail 화면을 실제로 띄우는 곳은 반드시 이 셋을 넘겨야 한다 —
  // 넘기지 않은 채로 그 화면까지 도달하면(연동 전용처럼 원래 도달할 일이 없는
  // 곳이 아니라면) 잘못 연결된 것이므로 조용히 무시하지 않고 바로 에러를 던진다.
  onAddRegularSchedule = () => {
    throw new Error('onAddRegularSchedule 없이 정기 일정 화면에 진입했습니다.');
  },
  onEditRegularSchedule = () => {
    throw new Error(
      'onEditRegularSchedule 없이 정기 일정 화면에 진입했습니다.',
    );
  },
  onRemoveRegularSchedule = () => {
    throw new Error(
      'onRemoveRegularSchedule 없이 정기 일정 화면에 진입했습니다.',
    );
  },
  onRegularScheduleError = () => {},
  onDeleteAllRegularSchedules,
  onBeforeIndividualSchedule,
  onBeforeComplete,
  allowSkip = true,
  skipPath = '/',
  onExit,
  onClose,
  title = '일정 입력하기',
  individualScheduleHeading = '날짜를 클릭해 스케줄을 입력해주세요',
  individualScheduleDescription,
  individualScheduleMinDate,
  individualScheduleMaxDate,
  calendarConnectTitle,
  calendarConnectProgress,
  calendarConnectContinuesToSchedule = false,
  onConnectGoogleCalendar,
  endsAtIncludeHalfDayHoliday = false,
  completeTitle,
  completeHeading,
  completeDescription,
  completePrimaryText,
  onCompletePrimaryClick,
  completeSecondaryText,
  onCompleteSecondaryClick,
  completeShowConfetti = false,
}: BasicInfoProps) {
  const router = useRouter();
  const [screenHistory, setScreenHistory] = useState<BasicInfoScreen[]>([
    initialScreen,
  ]);
  const [value, setValue] = useState<BasicInfoValue>(initialValue);
  // 정기 일정 등을 합쳐 계산된 읽기 전용 배경값 — 캘린더에 보여주기만 하고
  // value.individualSchedule(실제 저장 대상)과는 분리해서 들고 있는다. 합쳐서
  // 들고 있으면 사용자가 건드리지 않은, 정기 패턴 때문일 뿐인 날짜까지 개별
  // 오버라이드로 저장돼버려서 이후 정기 패턴이 바뀌어도 그 값에 고정되어버린다.
  const [individualScheduleBackdrop, setIndividualScheduleBackdrop] =
    useState<IndividualScheduleValueT>({});
  // 앱(WebView)에서는 네이티브 구글 SDK 응답(계정 선택·동의 화면)을 기다리는 동안
  // 이 화면을 벗어나지 않고 그대로 대기한다 — 그 사이 버튼이 중복 클릭되지 않게 막는다.
  const [isConnectingGoogleCalendar, setIsConnectingGoogleCalendar] =
    useState(false);

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

  const handleHasRegularScheduleNext = async (hasRegularSchedule: boolean) => {
    if (hasRegularSchedule) {
      setValue((prev) => ({ ...prev, hasRegularSchedule: true }));
      navigateTo('regularScheduleDetail');
      return;
    }
    // "정기 일정 없어요"를 고른 즉시 기존 정기 일정을 전부 지운다 — 이 화면에
    // 들어오기 전 다른 방에서 정기 일정을 입력해뒀을 수도 있으므로, 답변과 실제
    // 저장된 값이 어긋나지 않게 맞춘다. 연차·휴일 정보는 이 답변과 무관하게 항상
    // 이어서 물어본다(정기 일정 없이도 연차는 쓸 수 있다). 삭제가 실패하면 로컬
    // 값을 건드리지 않아, 실제로는 남아있는 서버 데이터와 화면이 어긋나지 않는다.
    try {
      await onDeleteAllRegularSchedules?.();
    } catch (error) {
      onRegularScheduleError(
        error instanceof Error
          ? error.message
          : '정기 일정을 삭제하지 못했어요.',
      );
      return;
    }
    setValue((prev) => ({
      ...prev,
      hasRegularSchedule: false,
      regularSchedules: [],
    }));
    navigateTo('annualLeaveCount');
  };

  // "일정 변경이 있나요?"는 답변과 무관하게 항상 같은 화면(정기 일정 수정)으로
  // 이어진다 — 실제 분기 목적이 아니라, 갱신 입력 사용자에게 "처음부터 다시
  // 입력하는 게 아니라 기존 정보를 확인·수정하는 과정"임을 안내하기 위함이다.
  const handleScheduleChangedNext = () => {
    navigateTo('regularScheduleDetail');
  };

  const enterIndividualSchedule = async () => {
    // 아직 저장(onBeforeComplete)까지 가지 않고 뒤로 나갔다가 이 스텝을 다시
    // 통과하는 경우, 이전에 추가만 해두고 제출하지 않은 값은 버려야 한다.
    setValue((prev) => ({ ...prev, individualSchedule: {} }));
    const mergedIndividualSchedule = await onBeforeIndividualSchedule?.();
    if (mergedIndividualSchedule) {
      setIndividualScheduleBackdrop(mergedIndividualSchedule);
    }
    navigateTo('individualSchedule');
  };

  const handleSkip = () => {
    router.push(skipPath);
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
    const canProceed = (await onVacationPolicyNext?.(value)) ?? true;
    if (!canProceed) return;
    if (endsAtIncludeHalfDayHoliday) {
      navigateTo('complete');
      return;
    }
    await enterIndividualSchedule();
  };

  const handleIndividualScheduleNext = async () => {
    const canProceed =
      (await onBeforeComplete?.(value, individualScheduleBackdrop)) ?? true;
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

  // calendarConnectContinuesToSchedule(회원가입처럼 더 큰 플로우에 얹은 경우)일 땐
  // 완료 확인 화면 없이 바로 다음 스텝(hasRegularSchedule)으로 이어진다 — 브라우저
  // 리다이렉트 방식이 돌아올 때도 resumeScreen으로 완료 화면을 건너뛰고 곧장 그
  // 화면으로 보내는 것과 동일한 동작이다.
  const handleConnectGoogleCalendar = async () => {
    if (isConnectingGoogleCalendar) return;
    setIsConnectingGoogleCalendar(true);
    try {
      const isConnected = (await onConnectGoogleCalendar?.()) ?? false;
      if (!isConnected) return;
      navigateTo(
        calendarConnectContinuesToSchedule
          ? 'hasRegularSchedule'
          : 'calendarConnectComplete',
      );
    } finally {
      setIsConnectingGoogleCalendar(false);
    }
  };

  if (screen === 'calendarConnectIntro') {
    return (
      <CalendarConnectIntroStep
        title={calendarConnectTitle}
        progress={calendarConnectProgress}
        onBack={handleBack}
        onConnect={handleConnectGoogleCalendar}
        isConnecting={isConnectingGoogleCalendar}
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
        heading={individualScheduleHeading}
        description={individualScheduleDescription}
        initialYear={individualScheduleMinDate?.getFullYear()}
        initialMonth={
          individualScheduleMinDate
            ? individualScheduleMinDate.getMonth() + 1
            : undefined
        }
        value={value.individualSchedule}
        onChange={(individualSchedule) =>
          setValue((prev) => ({ ...prev, individualSchedule }))
        }
        mergedStatus={individualScheduleBackdrop}
        minDate={individualScheduleMinDate}
        maxDate={individualScheduleMaxDate}
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
        showConfetti={completeShowConfetti}
        showHeader
        onBack={handleBack}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col">
      <Header
        variant="page"
        title={title}
        onBack={handleBack}
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
        {screen === 'scheduleChanged' && (
          <ScheduleChangedStep onNext={handleScheduleChangedNext} />
        )}
        {screen === 'regularScheduleDetail' && (
          <RegularScheduleDetailStep
            value={value.regularSchedules}
            onChange={(regularSchedules) =>
              setValue((prev) => ({ ...prev, regularSchedules }))
            }
            onNext={handleRegularScheduleDetailNext}
            onSkip={allowSkip ? handleSkip : undefined}
            // 위저드가 'hasRegularSchedule'(최초 입력 질문)로 시작하지 않았다면
            // ─ 즉 'scheduleChanged'(갱신 입력 안내)를 거쳤거나 부모가
            // initialScreen="regularScheduleDetail"로 곧장 연 경우(마이페이지·
            // 여행방 내 수정) ─ 목록이 비어 있어도 목록 화면으로 시작한다.
            // "네"를 고르고 들어온 최초 입력만 목록 길이로 판단하는 기존
            // 동작을 그대로 쓴다.
            startInListView={
              screenHistory[0] !== 'hasRegularSchedule' ? true : undefined
            }
            onAddSchedule={onAddRegularSchedule}
            onEditSchedule={onEditRegularSchedule}
            onRemoveSchedule={onRemoveRegularSchedule}
            onError={onRegularScheduleError}
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
    </div>
  );
}

export default BasicInfo;
